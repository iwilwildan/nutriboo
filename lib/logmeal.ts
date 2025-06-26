import * as ImageManipulator from 'expo-image-manipulator';

export type Macro = { calories: number; protein: number; carbs: number; fat: number };

export const LOGMEAL_API_KEY = process.env.EXPO_PUBLIC_LOGMEAL_API_KEY
export const LOGMEAL_BASE    = process.env.EXPO_PUBLIC_LOGMEAL_BASE

export async function ensureJpeg(uri: string): Promise<string> {
  // Detect extension – if already jpg|jpeg just return
  if (uri.toLowerCase().match(/\.(jpe?g)$/)) return uri;

  // Otherwise convert → JPEG (quality 0.8 keeps file small)
  const { uri: jpeg } = await ImageManipulator.manipulateAsync(
    uri,
    [],                                 // no transforms, just re-encode
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  return jpeg;
}

export async function segmentImage(uri: string) {
  const form = new FormData();
  form.append('image', {
    uri,
    name: 'photo.jpeg',
    type: 'image/jpeg',
  } as any);

  const r = await fetch(
    `${LOGMEAL_BASE}/image/segmentation/complete/v1.0?language=eng`,
    { method: 'POST', headers: { Authorization: `Bearer ${LOGMEAL_API_KEY}` }, body: form }
  );
  if (!r.ok) throw new Error(`Segmentation failed: ${r.status}`);
  const json =  await r.json();
  return json;              
}

export async function nutritionFromImage(imageId: string) {
  const r = await fetch(`${LOGMEAL_BASE}/nutrition/recipe/nutritionalInfo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LOGMEAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageId }),
  });
  if (!r.ok) throw new Error(`Nutrition failed: ${r.status}`);
  const json = await r.json();
  return json;              
}

/**
 * Extract the N most-probable, unique dish names from a LogMeal
 * segmentation response.
 *
 * @param seg   The full JSON returned by /image/segmentation/complete/…
 * @param count How many distinct dish names you want (default 2)
 */
export function getTopDishNames(seg: any, count = 2): string[] {
  if (!seg?.segmentation_results?.length) return [];

  // 1️⃣ collect every { name, prob } pair from all regions
  const all: { name: string; prob: number }[] = seg.segmentation_results.flatMap(
    (region: any) => region.recognition_results
  );

  // 2️⃣ sort by descending probability
  all.sort((a, b) => b.prob - a.prob);

  // 3️⃣ deduplicate by dish name, preserving highest-prob hit first
  const unique = [...new Map(all.map(item => [item.name, item])).values()];

  // 4️⃣ return the first N names
  return unique.slice(0, count).map(x => x.name);
}

/* ------------------------------------------------------------------ */
/*  Extract calories + macros from /nutrition response                */
/* ------------------------------------------------------------------ */

export function extractMacros(nutrit: any): Macro {
  const info = nutrit?.nutritional_info ?? {};
  const tn   = info.totalNutrients ?? {};

  return {
    calories: Math.round(info.calories              ?? 0),
    protein:  Math.round(tn.PROCNT?.quantity        ?? tn.PROCNT?.[0]?.quantity ?? 0),
    carbs:    Math.round(tn.CHOCDF?.quantity        ?? tn.CHOCDF?.[0]?.quantity ?? 0),
    fat:      Math.round(tn.FAT?.quantity           ?? tn.FAT?.[0]?.quantity    ?? 0),
  };
}
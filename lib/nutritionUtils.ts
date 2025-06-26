import { supabase } from '@/lib/supabase';

export interface DailyNutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface CurrentNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Default daily nutrition targets (can be customized based on child's age/weight)
export const getDefaultNutritionTargets = (age: number): DailyNutritionTargets => {
  // Basic targets based on age groups
  if (age <= 3) {
    return { calories: 1000, protein: 25, carbs: 130, fat: 35 };
  } else if (age <= 6) {
    return { calories: 1200, protein: 30, carbs: 150, fat: 40 };
  } else if (age <= 10) {
    return { calories: 1600, protein: 35, carbs: 200, fat: 50 };
  } else {
    return { calories: 2000, protein: 45, carbs: 250, fat: 65 };
  }
};

export const fetchDailyNutrition = async (childId: string): Promise<CurrentNutrition> => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Fetch meals for today
    const { data: meals, error } = await supabase
      .from('meals')
      .select('calories, protein, carbs, fat')
      .eq('child_id', childId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());
    
    if (error) throw error;
    
    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    if (meals && meals.length > 0) {
      meals.forEach(meal => {
        totalCalories += meal.calories || 0;
        totalProtein += meal.protein || 0;
        totalCarbs += meal.carbs || 0;
        totalFat += meal.fat || 0;
      });
    }
    
    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat
    };
  } catch (error) {
    console.error('Error fetching daily nutrition:', error);
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
};

export const calculateNutritionProgress = (
  current: CurrentNutrition,
  targets: DailyNutritionTargets
): { [key: string]: number } => {
  return {
    calories: (current.calories / targets.calories) * 100,
    protein: (current.protein / targets.protein) * 100,
    carbs: (current.carbs / targets.carbs) * 100,
    fat: (current.fat / targets.fat) * 100
  };
};
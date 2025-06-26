export interface SnackSuggestion {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl: string;
  recipe: string;
  category: 'morning' | 'afternoon' | 'both';
}

export const snackSuggestions: SnackSuggestion[] = [
  {
    id: '1',
    name: 'Banana Oat Energy Balls',
    calories: 180,
    protein: 6,
    carbs: 28,
    fat: 7,
    imageUrl: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    recipe: '1. Mash 1 ripe banana\n2. Mix with 1/2 cup rolled oats\n3. Add 2 tbsp peanut butter\n4. Form into balls and chill for 30 minutes',
    category: 'both'
  },
  {
    id: '2',
    name: 'Greek Yogurt with Berries',
    calories: 150,
    protein: 15,
    carbs: 20,
    fat: 3,
    imageUrl: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400',
    recipe: '1. Take 1 cup Greek yogurt\n2. Add 1/2 cup mixed berries\n3. Drizzle with 1 tsp honey\n4. Sprinkle with granola if desired',
    category: 'both'
  },
  {
    id: '3',
    name: 'Apple Slices with Almond Butter',
    calories: 200,
    protein: 8,
    carbs: 25,
    fat: 12,
    imageUrl: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    recipe: '1. Slice 1 medium apple\n2. Serve with 2 tbsp almond butter\n3. Sprinkle with cinnamon\n4. Optional: add a few raisins',
    category: 'both'
  },
  {
    id: '4',
    name: 'Whole Grain Crackers with Cheese',
    calories: 160,
    protein: 8,
    carbs: 18,
    fat: 7,
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    recipe: '1. Take 8-10 whole grain crackers\n2. Add 1 oz cheese slices\n3. Optional: add cucumber slices\n4. Serve immediately',
    category: 'both'
  },
  {
    id: '5',
    name: 'Smoothie Bowl',
    calories: 220,
    protein: 12,
    carbs: 35,
    fat: 6,
    imageUrl: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    recipe: '1. Blend 1 banana, 1/2 cup berries, 1/2 cup milk\n2. Pour into bowl\n3. Top with granola and nuts\n4. Add fresh fruit slices',
    category: 'morning'
  },
  {
    id: '6',
    name: 'Hummus with Veggie Sticks',
    calories: 140,
    protein: 6,
    carbs: 16,
    fat: 7,
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    recipe: '1. Cut carrots, cucumbers, and bell peppers\n2. Serve with 1/4 cup hummus\n3. Optional: add cherry tomatoes\n4. Sprinkle with paprika',
    category: 'afternoon'
  },
  {
    id: '7',
    name: 'Mini Whole Wheat Muffin',
    calories: 190,
    protein: 5,
    carbs: 32,
    fat: 6,
    imageUrl: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    recipe: '1. Mix 1 cup whole wheat flour, 1/2 cup oats\n2. Add mashed banana and milk\n3. Bake in mini muffin tins\n4. Cool before serving',
    category: 'both'
  },
  {
    id: '8',
    name: 'Trail Mix',
    calories: 170,
    protein: 6,
    carbs: 20,
    fat: 9,
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    recipe: '1. Mix 1/4 cup nuts (almonds, walnuts)\n2. Add 2 tbsp dried fruits\n3. Include a few dark chocolate chips\n4. Store in airtight container',
    category: 'afternoon'
  }
];

export const getRandomSnackSuggestion = (timeOfDay: 'morning' | 'afternoon'): SnackSuggestion => {
  const filteredSnacks = snackSuggestions.filter(
    snack => snack.category === timeOfDay || snack.category === 'both'
  );
  
  const randomIndex = Math.floor(Math.random() * filteredSnacks.length);
  return filteredSnacks[randomIndex];
};
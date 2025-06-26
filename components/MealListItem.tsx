import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

type Meal = {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'morning_snack' | 'afternoon_snack';
  food_items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
  photo_url?: string;
};

interface MealListItemProps {
  meal: Meal;
  onPress: () => void;
}

export function MealListItem({ meal, onPress }: MealListItemProps) {
  const { colors, spacing, typography } = useTheme();
  const { t, locale } = useLanguage();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case 'breakfast': return t('mealTypes.breakfast');
      case 'lunch': return t('mealTypes.lunch');
      case 'dinner': return t('mealTypes.dinner');
      case 'morning_snack': return t('mealTypes.morningSnack');
      case 'afternoon_snack': return t('mealTypes.afternoonSnack');
      default: return type;
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: spacing.md,
      overflow: 'hidden',
    },
    content: {
      flexDirection: 'row',
      padding: spacing.md,
    },
    imageContainer: {
      width: 80,
      height: 80,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: colors.border,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholderImage: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoContainer: {
      flex: 1,
      marginLeft: spacing.md,
      justifyContent: 'space-between',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    mealType: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.text,
    },
    timeText: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
    },
    foodItems: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
      marginBottom: spacing.sm,
    },
    nutritionRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    nutritionItem: {
      marginRight: spacing.md,
    },
    nutritionValue: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.primary,
    },
    nutritionLabel: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {meal.photo_url ? (
            <Image source={{ uri: meal.photo_url }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text>🍽️</Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.mealType}>{getMealTypeLabel(meal.meal_type)}</Text>
              <Text style={styles.timeText}>{formatDate(meal.created_at)}</Text>
            </View>
            
            <Text style={styles.foodItems} numberOfLines={1}>
              {meal.food_items?.join(', ') || t('meal.noFoodItems')}
            </Text>
          </View>
          
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{meal.calories} kcal</Text>
              <Text style={styles.nutritionLabel}>{t('nutrition.calories')}</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{meal.protein}g</Text>
              <Text style={styles.nutritionLabel}>{t('nutrition.protein')}</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{meal.carbs}g</Text>
              <Text style={styles.nutritionLabel}>{t('nutrition.carbs')}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Utensils, Trash2, CreditCard as Edit2 } from 'lucide-react-native';

type Meal = {
  id: string;
  child_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'morning_snack' | 'afternoon_snack';
  food_items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
  photo_url?: string;
  children?: {
    name: string;
  };
};

export default function MealDetailsScreen() {
  const { colors, spacing, typography } = useTheme();
  const { t, locale } = useLanguage();
  const { id } = useLocalSearchParams();
  
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMealDetails();
    }
  }, [id]);

  const fetchMealDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('meals')
        .select(`
          *,
          children (
            name
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setMeal(data);
    } catch (error) {
      console.error('Error fetching meal details:', error);
      Alert.alert(t('common.error'), 'Failed to load meal details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async () => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal? This action cannot be undone.',
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('meals')
                .delete()
                .eq('id', id);
              
              if (error) throw error;
              
              router.back();
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert(t('common.error'), 'Failed to delete meal');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
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
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      padding: spacing.lg,
    },
    imageContainer: {
      width: '100%',
      height: 250,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      marginBottom: spacing.lg,
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
    placeholderText: {
      fontSize: 48,
      marginBottom: spacing.sm,
    },
    placeholderLabel: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.textMedium,
    },
    headerSection: {
      marginBottom: spacing.lg,
    },
    mealType: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xxl,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    childName: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.primary,
      marginBottom: spacing.md,
    },
    dateTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    dateTimeText: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.textMedium,
      marginLeft: spacing.sm,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.text,
      marginBottom: spacing.md,
    },
    foodItem: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.textMedium,
      marginBottom: spacing.xs,
      paddingLeft: spacing.sm,
    },
    nutritionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    nutritionItem: {
      width: '48%',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    nutritionValue: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xl,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    nutritionLabel: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.lg,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteButton: {
      borderColor: colors.error,
    },
    actionButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.textMedium,
      marginLeft: spacing.sm,
    },
    deleteButtonText: {
      color: colors.error,
    },
  });

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Meal Details' }} />
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textMedium, marginTop: spacing.md }}>
            Loading meal details...
          </Text>
        </View>
      </>
    );
  }

  if (!meal) {
    return (
      <>
        <Stack.Screen options={{ title: 'Meal Details' }} />
        <View style={[styles.container, styles.loadingContainer]}>
          <Text style={{ color: colors.textMedium }}>Meal not found</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Meal Details' }} />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {meal.photo_url ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: meal.photo_url }} style={styles.image} />
            </View>
          ) : (
            <View style={[styles.imageContainer, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>🍽️</Text>
              <Text style={styles.placeholderLabel}>No photo available</Text>
            </View>
          )}

          <View style={styles.headerSection}>
            <Text style={styles.mealType}>{getMealTypeLabel(meal.meal_type)}</Text>
            {meal.children && (
              <Text style={styles.childName}>{meal.children.name}</Text>
            )}
            
            <View style={styles.dateTimeContainer}>
              <Calendar size={16} color={colors.textMedium} />
              <Text style={styles.dateTimeText}>{formatDate(meal.created_at)}</Text>
            </View>
            
            <View style={styles.dateTimeContainer}>
              <Clock size={16} color={colors.textMedium} />
              <Text style={styles.dateTimeText}>{formatTime(meal.created_at)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('mealForm.foodItems')}</Text>
            {meal.food_items && meal.food_items.length > 0 ? (
              meal.food_items.map((item, index) => (
                <Text key={index} style={styles.foodItem}>• {item}</Text>
              ))
            ) : (
              <Text style={styles.foodItem}>{t('meal.noFoodItems')}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('mealForm.nutritionInfo')}</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{meal.calories}</Text>
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
              
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{meal.fat}g</Text>
                <Text style={styles.nutritionLabel}>{t('nutrition.fat')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Edit2 size={16} color={colors.textMedium} />
              <Text style={styles.actionButtonText}>Edit Meal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteMeal}
            >
              <Trash2 size={16} color={colors.error} />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
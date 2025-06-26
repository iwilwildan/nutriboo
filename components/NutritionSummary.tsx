import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';

interface NutritionSummaryProps {
  childId: string;
}

export function NutritionSummary({ childId }: NutritionSummaryProps) {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    calories: { current: 0, target: 1200 },
    protein: { current: 0, target: 30 },
    carbs: { current: 0, target: 150 },
    fat: { current: 0, target: 40 }
  });

  // Refresh nutrition data when screen comes into focus or childId changes
  useFocusEffect(
    useCallback(() => {
      if (childId) {
        fetchNutritionData();
      }
    }, [childId])
  );

  const fetchNutritionData = async () => {
    try {
      setLoading(true);
      
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
      
      // In a real app, you would fetch the target values from a separate table
      // based on the child's age, weight, etc.
      setData({
        calories: { current: totalCalories, target: 1200 },
        protein: { current: totalProtein, target: 30 },
        carbs: { current: totalCarbs, target: 150 },
        fat: { current: totalFat, target: 40 }
      });
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.lg,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    nutrientRow: {
      marginBottom: spacing.md,
    },
    nutrientHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    nutrientLabel: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.text,
    },
    nutrientValues: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 4,
    },
    caloriesBar: {
      backgroundColor: colors.primary,
    },
    proteinBar: {
      backgroundColor: colors.accent,
    },
    carbsBar: {
      backgroundColor: colors.secondary,
    },
    fatBar: {
      backgroundColor: colors.error,
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.nutrientRow}>
        <View style={styles.nutrientHeader}>
          <Text style={styles.nutrientLabel}>{t('nutrition.calories')}</Text>
          <Text style={styles.nutrientValues}>{data.calories.current} / {data.calories.target} kcal</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              styles.caloriesBar, 
              { width: `${calculatePercentage(data.calories.current, data.calories.target)}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.nutrientRow}>
        <View style={styles.nutrientHeader}>
          <Text style={styles.nutrientLabel}>{t('nutrition.protein')}</Text>
          <Text style={styles.nutrientValues}>{data.protein.current}g / {data.protein.target}g</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              styles.proteinBar, 
              { width: `${calculatePercentage(data.protein.current, data.protein.target)}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.nutrientRow}>
        <View style={styles.nutrientHeader}>
          <Text style={styles.nutrientLabel}>{t('nutrition.carbs')}</Text>
          <Text style={styles.nutrientValues}>{data.carbs.current}g / {data.carbs.target}g</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              styles.carbsBar, 
              { width: `${calculatePercentage(data.carbs.current, data.carbs.target)}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.nutrientRow}>
        <View style={styles.nutrientHeader}>
          <Text style={styles.nutrientLabel}>{t('nutrition.fat')}</Text>
          <Text style={styles.nutrientValues}>{data.fat.current}g / {data.fat.target}g</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              styles.fatBar, 
              { width: `${calculatePercentage(data.fat.current, data.fat.target)}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
}
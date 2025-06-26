import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { router, useFocusEffect } from 'expo-router';
import { Camera, ChevronRight, Utensils, ChartBar as BarChart } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { ChildSelector } from '@/components/ChildSelector';
import { AffirmationCard } from '@/components/AffirmationCard';
import { NutritionSummary } from '@/components/NutritionSummary';
import { useSnackSuggestions } from '@/hooks/useSnackSuggestions';

type Child = {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  photo_url?: string;
};

export default function HomeScreen() {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  const { session } = useAuth();

  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize snack suggestions hook
  useSnackSuggestions({
    selectedChildId: selectedChild?.id || null,
    selectedChildAge: selectedChild?.age || 5
  });

  // Refresh children data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (session) {
        fetchChildren();
      }
    }, [session])
  );

  const fetchChildren = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', session?.user.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setChildren(data);
        // Keep the same selected child if it still exists, otherwise select the first one
        const currentSelectedId = selectedChild?.id;
        const stillExists = data.find(child => child.id === currentSelectedId);
        setSelectedChild(stillExists || data[0]);
      } else {
        setChildren([]);
        setSelectedChild(null);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMeal = () => {
    router.push('/meal');
  };

  const handleViewProgress = () => {
    router.push('/progress');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: spacing.lg,
    },
    header: {
      marginBottom: spacing.lg,
    },
    welcomeText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xxl,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    dateText: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.textMedium,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.text,
      marginBottom: spacing.md,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginHorizontal: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.primary,
      marginLeft: spacing.sm,
    },
    noChildContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginVertical: spacing.lg,
    },
    noChildText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.textMedium,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    addChildButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: 8,
    },
    addChildButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: '#FFFFFF',
    },
  });

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString(useLanguage().locale, { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>{t('home.welcome')}</Text>
          <Text style={styles.dateText}>{formatDate()}</Text>
        </View>

        {children.length > 0 ? (
          <>
            <ChildSelector 
              children={children}
              selectedChild={selectedChild}
              onSelectChild={setSelectedChild}
              onAddChild={() => router.push('/add-child')}
            />

            <View style={styles.section}>
              <AffirmationCard />
            </View>

            {selectedChild && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t('home.todayNutrition', { name: selectedChild.name })}
                </Text>
                <NutritionSummary childId={selectedChild.id} />
              </View>
            )}

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleAddMeal}>
                <Utensils size={20} color={colors.primary} />
                <Text style={styles.actionButtonText}>{t('home.addMeal')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleViewProgress}>
                <BarChart size={20} color={colors.primary} />
                <Text style={styles.actionButtonText}>{t('home.viewProgress')}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.noChildContainer}>
            <Text style={styles.noChildText}>{t('home.noChildProfile')}</Text>
            <TouchableOpacity 
              style={styles.addChildButton}
              onPress={() => router.push('/add-child')}
            >
              <Text style={styles.addChildButtonText}>{t('home.addChild')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
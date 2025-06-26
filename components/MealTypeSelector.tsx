import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface MealTypeSelectorProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

export function MealTypeSelector({ selectedType, onSelectType }: MealTypeSelectorProps) {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();

  const mealTypes = [
    { id: 'all', label: t('mealTypes.all') },
    { id: 'breakfast', label: t('mealTypes.breakfast') },
    { id: 'morning_snack', label: t('mealTypes.morningSnack') },
    { id: 'lunch', label: t('mealTypes.lunch') },
    { id: 'afternoon_snack', label: t('mealTypes.afternoonSnack') },
    { id: 'dinner', label: t('mealTypes.dinner') },
  ];

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    scrollView: {
      marginBottom: spacing.xs,
    },
    typesRow: {
      flexDirection: 'row',
      paddingBottom: spacing.sm,
    },
    typeButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      marginRight: spacing.sm,
      backgroundColor: colors.surface,
    },
    selectedTypeButton: {
      backgroundColor: colors.primary,
    },
    typeText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
    },
    selectedTypeText: {
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.typesRow}
      >
        {mealTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              selectedType === type.id && styles.selectedTypeButton
            ]}
            onPress={() => onSelectType(type.id)}
          >
            <Text style={[
              styles.typeText,
              selectedType === type.id && styles.selectedTypeText
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
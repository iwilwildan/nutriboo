import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface ProgressTimeSelectorProps {
  selectedRange: 'week' | 'month';
  onSelectRange: (range: 'week' | 'month') => void;
}

export function ProgressTimeSelector({ selectedRange, onSelectRange }: ProgressTimeSelectorProps) {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 2,
      marginVertical: spacing.md,
    },
    option: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
    },
    optionText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
    },
    selectedOption: {
      backgroundColor: colors.primary,
    },
    selectedOptionText: {
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.option,
          selectedRange === 'week' && styles.selectedOption
        ]}
        onPress={() => onSelectRange('week')}
      >
        <Text style={[
          styles.optionText,
          selectedRange === 'week' && styles.selectedOptionText
        ]}>
          {t('progress.thisWeek')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.option,
          selectedRange === 'month' && styles.selectedOption
        ]}
        onPress={() => onSelectRange('month')}
      >
        <Text style={[
          styles.optionText,
          selectedRange === 'month' && styles.selectedOptionText
        ]}>
          {t('progress.thisMonth')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Edit2, Trash2, User } from 'lucide-react-native';

type Child = {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  photo_url?: string;
};

interface ChildProfileCardProps {
  child: Child;
  onEdit: () => void;
  onDelete: () => void;
}

export function ChildProfileCard({ child, onEdit, onDelete }: ChildProfileCardProps) {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatar: {
      width: 60,
      height: 60,
    },
    infoContainer: {
      flex: 1,
      marginLeft: spacing.md,
    },
    name: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    detailsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    detailItem: {
      marginRight: spacing.md,
      marginBottom: spacing.xs,
    },
    detailLabel: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
    },
    detailValue: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
    },
    actionsContainer: {
      flexDirection: 'row',
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {child.photo_url ? (
          <Image source={{ uri: child.photo_url }} style={styles.avatar} />
        ) : (
          <User size={30} color={colors.textMedium} />
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{child.name}</Text>
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('profile.age')}</Text>
            <Text style={styles.detailValue}>{child.age} {t('profile.years')}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('profile.weight')}</Text>
            <Text style={styles.detailValue}>{child.weight} kg</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('profile.height')}</Text>
            <Text style={styles.detailValue}>{child.height} cm</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Edit2 size={16} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Trash2 size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
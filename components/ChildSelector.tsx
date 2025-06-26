import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, User } from 'lucide-react-native';

type Child = {
  id: string;
  name: string;
  photo_url?: string;
};

interface ChildSelectorProps {
  children: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
  onAddChild: () => void;
}

export function ChildSelector({ children, selectedChild, onSelectChild, onAddChild }: ChildSelectorProps) {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    title: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.textMedium,
      marginBottom: spacing.sm,
    },
    scrollView: {
      marginBottom: spacing.xs,
    },
    childrenRow: {
      flexDirection: 'row',
      paddingBottom: spacing.sm,
    },
    childItem: {
      alignItems: 'center',
      marginRight: spacing.lg,
    },
    avatarContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedAvatar: {
      borderColor: colors.primary,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    childName: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.text,
      textAlign: 'center',
      maxWidth: 80,
    },
    addButtonContainer: {
      alignItems: 'center',
      marginRight: spacing.lg,
    },
    addButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
    },
    addButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('childSelector.title')}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={styles.childrenRow}
      >
        {children.map((child) => (
          <TouchableOpacity
            key={child.id}
            style={styles.childItem}
            onPress={() => onSelectChild(child)}
          >
            <View style={[
              styles.avatarContainer,
              selectedChild?.id === child.id && styles.selectedAvatar
            ]}>
              {child.photo_url ? (
                <Image source={{ uri: child.photo_url }} style={styles.avatar} />
              ) : (
                <User size={30} color={colors.textMedium} />
              )}
            </View>
            <Text style={styles.childName} numberOfLines={1}>{child.name}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={styles.addButtonContainer} onPress={onAddChild}>
          <View style={styles.addButton}>
            <Plus size={24} color={colors.primary} />
          </View>
          <Text style={styles.addButtonText}>{t('childSelector.add')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
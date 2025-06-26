import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Chrome as Home, Utensils, ChartLine as LineChart, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { colors, typography } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.semiBold,
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 5,
        },
        headerTitleStyle: {
          fontFamily: typography.fontFamily.bold,
          fontSize: typography.fontSize.lg,
          color: colors.text,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerTitle: 'Nutriboo',
        }}
      />
      <Tabs.Screen
        name="meal"
        options={{
          title: t('tabs.meal'),
          tabBarIcon: ({ color, size }) => <Utensils size={size} color={color} />,
          headerTitle: t('screens.meal'),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('tabs.progress'),
          tabBarIcon: ({ color, size }) => <LineChart size={size} color={color} />,
          headerTitle: t('screens.progress'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          headerTitle: t('screens.profile'),
        }}
      />
    </Tabs>
  );
}
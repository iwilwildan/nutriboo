import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { User, Moon, Globe, LogOut, Settings, ChevronRight, Plus, Shield, CircleHelp as HelpCircle, Bell } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { ChildProfileCard } from '@/components/ChildProfileCard';
import { NotificationTester } from '@/components/NotificationTester';

type Child = {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  photo_url?: string;
};

export default function ProfileScreen() {
  const { colors, spacing, typography, theme, toggleTheme } = useTheme();
  const { t, locale, changeLanguage, languages } = useLanguage();
  const { session, signOut } = useAuth();
  
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showNotificationTester, setShowNotificationTester] = useState(false);

  useEffect(() => {
    if (session) {
      setUserEmail(session.user.email || '');
      fetchChildren();
    }
  }, [session]);

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('name');
      
      if (error) throw error;
      
      setChildren(data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = () => {
    const newLocale = locale === 'en' ? 'id' : 'en';
    changeLanguage(newLocale);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteChild = async (childId: string) => {
    Alert.alert(
      t('profile.deleteChildTitle'),
      t('profile.deleteChildMessage'),
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
                .from('children')
                .delete()
                .eq('id', childId);
              
              if (error) throw error;
              
              // Update the state to remove the deleted child
              setChildren(prevChildren => prevChildren.filter(child => child.id !== childId));
            } catch (error) {
              console.error('Error deleting child:', error);
              Alert.alert(t('common.error'), t('profile.deleteChildError'));
            }
          }
        }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    profileHeader: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    avatarText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xxxl,
      color: '#FFFFFF',
    },
    email: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.text,
    },
    sectionTitle: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.text,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
    },
    childrenContainer: {
      marginBottom: spacing.lg,
    },
    addChildButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    addChildText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.primary,
      marginLeft: spacing.sm,
    },
    settingsCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: spacing.lg,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingItemLast: {
      borderBottomWidth: 0,
    },
    settingText: {
      flex: 1,
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.text,
      marginLeft: spacing.md,
    },
    languageValue: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
      marginRight: spacing.sm,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.error,
      borderRadius: 12,
      padding: spacing.md,
      marginTop: spacing.lg,
    },
    logoutText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: '#FFFFFF',
      marginLeft: spacing.sm,
    },
    testButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    testButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: '#FFFFFF',
      marginLeft: spacing.sm,
    },
    // Bolt.new badge styles
    boltBadgeContainer: {
      alignItems: 'center',
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    boltBadge: {
      width: 80,
      height: 80,
      resizeMode: 'contain',
      opacity: 0.6,
    },
    boltText: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            {userEmail ? (
              <Text style={styles.avatarText}>{userEmail[0].toUpperCase()}</Text>
            ) : (
              <User size={40} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.email}>{userEmail}</Text>
        </View>

        {/* Notification Testing Section */}
        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => setShowNotificationTester(!showNotificationTester)}
        >
          <Bell size={20} color="#FFFFFF" />
          <Text style={styles.testButtonText}>
            {showNotificationTester ? 'Hide' : 'Show'} Notification Tester
          </Text>
        </TouchableOpacity>

        {showNotificationTester && (
          <NotificationTester 
            childId={children[0]?.id} 
            childAge={children[0]?.age} 
          />
        )}

        <Text style={styles.sectionTitle}>{t('profile.children')}</Text>
        <View style={styles.childrenContainer}>
          {children.map((child) => (
            <ChildProfileCard
              key={child.id}
              child={child}
              onEdit={() => router.push(`/edit-child/${child.id}`)}
              onDelete={() => handleDeleteChild(child.id)}
            />
          ))}
          
          <TouchableOpacity 
            style={styles.addChildButton}
            onPress={() => router.push('/add-child')}
          >
            <Plus size={20} color={colors.primary} />
            <Text style={styles.addChildText}>{t('profile.addChild')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <Moon size={20} color={colors.text} />
            <Text style={styles.settingText}>{t('profile.darkMode')}</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Globe size={20} color={colors.text} />
            <Text style={styles.settingText}>{t('profile.language')}</Text>
            <Text style={styles.languageValue}>
              {locale === 'en' ? 'English' : 'Bahasa Indonesia'}
            </Text>
            <Switch
              value={locale === 'id'}
              onValueChange={handleLanguageToggle}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={locale === 'id' ? colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingItem, styles.settingItemLast]}>
            <Shield size={20} color={colors.text} />
            <Text style={styles.settingText}>{t('profile.privacy')}</Text>
            <ChevronRight size={20} color={colors.textMedium} />
          </View>
        </View>

        <View style={styles.settingsCard}>
          <View style={[styles.settingItem, styles.settingItemLast]}>
            <HelpCircle size={20} color={colors.text} />
            <Text style={styles.settingText}>{t('profile.help')}</Text>
            <ChevronRight size={20} color={colors.textMedium} />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>

        {/* Bolt.new Badge */}
        <View style={styles.boltBadgeContainer}>
          <Image 
            source={require('@/assets/images/white_circle_360x360.png')} 
            style={styles.boltBadge}
          />
          <Text style={styles.boltText}>
            Made with bolt.new
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Link, router } from 'expo-router';
import { Lock, Mail, ArrowLeft } from 'lucide-react-native';

export default function RegisterScreen() {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  const { signUp } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError(t('auth.emptyFields'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signUp(email, password);
      // Note: In a real app, you might want to show a confirmation screen instead
    } catch (err: any) {
      setError(err.message || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flexGrow: 1,
    },
    contentContainer: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: 'center',
      paddingBottom: spacing.xxl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    backButton: {
      padding: spacing.sm,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    logo: {
      width: 120,
      height: 120,
      resizeMode: 'contain',
    },
    title: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xxxl,
      color: colors.primary,
      textAlign: 'center',
      marginVertical: spacing.md,
    },
    subtitle: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.lg,
      color: colors.textMedium,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    inputContainer: {
      marginBottom: spacing.lg,
    },
    inputLabel: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
      marginBottom: spacing.xs,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
    },
    input: {
      flex: 1,
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.text,
      paddingVertical: spacing.md,
      paddingLeft: spacing.sm,
    },
    buttonContainer: {
      marginTop: spacing.md,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.md,
      color: '#FFFFFF',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.xl,
    },
    loginText: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
    },
    loginLink: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      marginLeft: spacing.xs,
    },
    errorText: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.error,
      marginTop: spacing.sm,
      textAlign: 'center',
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
      width: 60,
      height: 60,
      resizeMode: 'contain',
      opacity: 0.5,
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/icon.png')} 
            style={styles.logo} 
          />
          <Text style={styles.title}>Nutriboo</Text>
          <Text style={styles.subtitle}>{t('auth.createAccount')}</Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('auth.email')}</Text>
          <View style={styles.inputWrapper}>
            <Mail size={20} color={colors.textMedium} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('auth.password')}</Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color={colors.textMedium} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor={colors.textLight}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('auth.confirmPassword')}</Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color={colors.textMedium} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              placeholderTextColor={colors.textLight}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{t('auth.register')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>{t('auth.alreadyHaveAccount')}</Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </Link>
        </View>

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
    </KeyboardAvoidingView>
  );
}
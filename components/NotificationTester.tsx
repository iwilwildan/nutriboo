import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Animated } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import * as Notifications from 'expo-notifications';
import { getRandomSnackSuggestion } from '@/data/snackSuggestions';
import { Bell, TestTube, Clock, X, Sparkles } from 'lucide-react-native';

interface NotificationTesterProps {
  childId?: string;
  childAge?: number;
}

interface SimulatedNotification {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  type: string;
  data?: any;
}

export function NotificationTester({ childId = 'test-child', childAge = 5 }: NotificationTesterProps) {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  const [lastNotification, setLastNotification] = useState<string>('');
  const [simulatedNotification, setSimulatedNotification] = useState<SimulatedNotification | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Auto-hide simulated notification after 5 seconds
  useEffect(() => {
    if (simulatedNotification) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        hideSimulatedNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [simulatedNotification]);

  const hideSimulatedNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSimulatedNotification(null);
    });
  };

  const showSimulatedNotification = (title: string, body: string, type: string, data?: any) => {
    const notification: SimulatedNotification = {
      id: Date.now().toString(),
      title,
      body,
      timestamp: new Date(),
      type,
      data,
    };
    setSimulatedNotification(notification);
  };

  const testImmediateNotification = async () => {
    try {
      const snackSuggestion = getRandomSnackSuggestion('morning');
      
      const title = t('snackSuggestion.notificationTitle');
      const body = t('snackSuggestion.notificationBody', {
        snackName: snackSuggestion.name,
        calories: snackSuggestion.calories,
        protein: snackSuggestion.protein
      });

      // Show in-app simulation
      showSimulatedNotification(title, body, 'test_notification', { snackSuggestion, childId });

      // Try to send actual notification on native platforms
      if (Platform.OS !== 'web') {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              data: {
                snackSuggestion,
                childId,
                type: 'test_notification'
              },
            },
            trigger: null, // Send immediately
          });
        } catch (error) {
          console.log('Native notification failed (expected in Expo Go):', error);
        }
      }

      setLastNotification(`Sent: ${snackSuggestion.name} at ${new Date().toLocaleTimeString()}`);
      
      if (Platform.OS === 'web') {
        Alert.alert('Success', 'Test notification simulated! Check the notification banner above.');
      } else {
        Alert.alert('Success', 'Test notification sent! If you\'re using Expo Go, check the simulation banner above.');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const testDelayedNotification = async () => {
    try {
      const snackSuggestion = getRandomSnackSuggestion('afternoon');
      
      const title = t('snackSuggestion.notificationTitle');
      const body = t('snackSuggestion.notificationBody', {
        snackName: snackSuggestion.name,
        calories: snackSuggestion.calories,
        protein: snackSuggestion.protein
      });

      // Show immediate simulation for testing
      setTimeout(() => {
        showSimulatedNotification(`⏰ Delayed: ${title}`, body, 'test_delayed_notification', { snackSuggestion, childId });
      }, 3000); // Show after 3 seconds for demo

      // Try to schedule actual notification on native platforms
      if (Platform.OS !== 'web') {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              data: {
                snackSuggestion,
                childId,
                type: 'test_delayed_notification'
              },
            },
            trigger: { seconds: 10 }, // Send after 10 seconds
          });
        } catch (error) {
          console.log('Native notification scheduling failed (expected in Expo Go):', error);
        }
      }

      setLastNotification(`Scheduled: ${snackSuggestion.name} in 10 seconds (simulated in 3 seconds)`);
      Alert.alert('Success', 'Test notification scheduled! Watch for the simulation banner in 3 seconds.');
    } catch (error) {
      console.error('Error scheduling test notification:', error);
      Alert.alert('Error', 'Failed to schedule test notification');
    }
  };

  const simulateSnackTime = async () => {
    try {
      // Simulate morning snack time scenario
      const snackSuggestion = getRandomSnackSuggestion('morning');
      
      const title = '🕘 Simulated Snack Time Alert!';
      const body = `It's snack time! Try ${snackSuggestion.name} - ${snackSuggestion.calories} cal, ${snackSuggestion.protein}g protein!`;

      // Show in-app simulation
      showSimulatedNotification(title, body, 'simulated_snack_time', { snackSuggestion, childId });

      // Try to send actual notification on native platforms
      if (Platform.OS !== 'web') {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              data: {
                snackSuggestion,
                childId,
                type: 'simulated_snack_time'
              },
            },
            trigger: null,
          });
        } catch (error) {
          console.log('Native notification failed (expected in Expo Go):', error);
        }
      }

      setLastNotification(`Simulated snack time: ${snackSuggestion.name}`);
      Alert.alert('Success', 'Simulated snack time notification sent!');
    } catch (error) {
      console.error('Error sending simulated notification:', error);
      Alert.alert('Error', 'Failed to send simulated notification');
    }
  };

  const checkPermissions = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Web Platform', 'Notifications are not supported on web. Use the in-app simulation for testing.');
      return;
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      Alert.alert('Notification Permissions', `Current status: ${status}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to check permissions');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.lg,
      margin: spacing.md,
    },
    title: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.lg,
      color: colors.text,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    buttonContainer: {
      gap: spacing.md,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 8,
      gap: spacing.sm,
    },
    secondaryButton: {
      backgroundColor: colors.secondary,
    },
    warningButton: {
      backgroundColor: colors.warning,
    },
    buttonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: '#FFFFFF',
    },
    lastNotification: {
      marginTop: spacing.lg,
      padding: spacing.md,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    lastNotificationText: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
      textAlign: 'center',
    },
    webWarning: {
      backgroundColor: colors.warning + '20',
      padding: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.md,
    },
    webWarningText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.warning,
      textAlign: 'center',
    },
    // Simulated notification styles
    simulatedNotificationContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    simulatedNotification: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'flex-start',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    notificationIcon: {
      marginRight: spacing.md,
      marginTop: 2,
    },
    notificationContent: {
      flex: 1,
    },
    notificationTitle: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.md,
      color: '#FFFFFF',
      marginBottom: spacing.xs,
    },
    notificationBody: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: '#FFFFFF',
      lineHeight: typography.fontSize.sm * 1.4,
      marginBottom: spacing.xs,
    },
    notificationTime: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.xs,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    closeButton: {
      padding: spacing.xs,
      marginLeft: spacing.sm,
    },
    simulationBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginTop: spacing.xs,
    },
    simulationBadgeText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.xs,
      color: '#FFFFFF',
    },
  });

  return (
    <>
      {/* Simulated Notification Overlay */}
      {simulatedNotification && (
        <Animated.View 
          style={[
            styles.simulatedNotificationContainer,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.simulatedNotification}>
            <View style={styles.notificationIcon}>
              <Sparkles size={24} color="#FFFFFF" />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>
                {simulatedNotification.title}
              </Text>
              <Text style={styles.notificationBody}>
                {simulatedNotification.body}
              </Text>
              <Text style={styles.notificationTime}>
                {formatTime(simulatedNotification.timestamp)}
              </Text>
              <View style={styles.simulationBadge}>
                <Text style={styles.simulationBadgeText}>
                  IN-APP SIMULATION
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={hideSimulatedNotification}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Main Tester Component */}
      <View style={styles.container}>
        <Text style={styles.title}>🔔 Notification Tester</Text>
        <Text style={styles.subtitle}>
          Test the meal suggestion notification system with in-app simulation
        </Text>

        {Platform.OS === 'web' && (
          <View style={styles.webWarning}>
            <Text style={styles.webWarningText}>
              💡 Web Platform: Using in-app simulation for testing. Native notifications require iOS/Android builds.
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={testImmediateNotification}>
            <Bell size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Send Test Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={testDelayedNotification}
          >
            <Clock size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Schedule in 10 Seconds</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.warningButton]} 
            onPress={simulateSnackTime}
          >
            <TestTube size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Simulate Snack Time</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.textMedium }]} 
            onPress={checkPermissions}
          >
            <Text style={styles.buttonText}>Check Permissions</Text>
          </TouchableOpacity>
        </View>

        {lastNotification && (
          <View style={styles.lastNotification}>
            <Text style={styles.lastNotificationText}>
              Last action: {lastNotification}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}
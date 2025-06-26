import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDailyNutrition, getDefaultNutritionTargets, calculateNutritionProgress } from '@/lib/nutritionUtils';
import { getRandomSnackSuggestion } from '@/data/snackSuggestions';
import { useLanguage } from '@/context/LanguageContext';

interface UseSnackSuggestionsProps {
  selectedChildId: string | null;
  selectedChildAge?: number;
}

export const useSnackSuggestions = ({ selectedChildId, selectedChildAge = 5 }: UseSnackSuggestionsProps) => {
  const { t } = useLanguage();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!selectedChildId || Platform.OS === 'web') {
      return;
    }

    const checkNutritionAndSuggest = async () => {
      try {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const today = now.toDateString();

        // Check if it's 15 minutes before snack time
        const isMorningSnackTime = currentHour === 9 && currentMinute === 45; // 9:45 AM (15 min before 10 AM)
        const isAfternoonSnackTime = currentHour === 15 && currentMinute === 45; // 3:45 PM (15 min before 4 PM)

        // For testing purposes, also trigger every 5 minutes during development
        const isTestTime = __DEV__ && currentMinute % 5 === 0;

        if (!isMorningSnackTime && !isAfternoonSnackTime && !isTestTime) {
          return;
        }

        // Check if we've already sent a notification for this snack time today
        const timeSlot = isMorningSnackTime ? 'morning' : isAfternoonSnackTime ? 'afternoon' : 'test';
        const storageKey = `snack_notification_${selectedChildId}_${today}_${timeSlot}`;
        
        // For test notifications, don't check storage to allow repeated testing
        if (!isTestTime) {
          const alreadySent = await AsyncStorage.getItem(storageKey);
          if (alreadySent) {
            return;
          }
        }

        // Fetch current nutrition data
        const currentNutrition = await fetchDailyNutrition(selectedChildId);
        const targets = getDefaultNutritionTargets(selectedChildAge);
        const progress = calculateNutritionProgress(currentNutrition, targets);

        // Calculate average progress
        const avgProgress = (progress.calories + progress.protein + progress.carbs + progress.fat) / 4;

        // Determine if suggestion is needed
        let shouldSuggest = false;
        let targetPercentage = 0;

        if (isMorningSnackTime || (isTestTime && currentHour < 12)) {
          targetPercentage = 33.33; // 1/3 of daily target
          shouldSuggest = avgProgress < targetPercentage;
        } else if (isAfternoonSnackTime || (isTestTime && currentHour >= 12)) {
          targetPercentage = 66.67; // 2/3 of daily target
          shouldSuggest = avgProgress < targetPercentage;
        }

        // For testing, always suggest if it's test time
        if (isTestTime) {
          shouldSuggest = true;
        }

        if (shouldSuggest) {
          // Get a random snack suggestion
          const timeOfDay = (isMorningSnackTime || (isTestTime && currentHour < 12)) ? 'morning' : 'afternoon';
          const snackSuggestion = getRandomSnackSuggestion(timeOfDay);

          // Create notification content
          const title = isTestTime ? '🧪 Test: ' + t('snackSuggestion.notificationTitle') : t('snackSuggestion.notificationTitle');
          const body = t('snackSuggestion.notificationBody', {
            snackName: snackSuggestion.name,
            calories: snackSuggestion.calories,
            protein: snackSuggestion.protein
          });

          // Schedule notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              data: {
                snackSuggestion,
                childId: selectedChildId,
                type: isTestTime ? 'test_snack_suggestion' : 'snack_suggestion',
                avgProgress: Math.round(avgProgress),
                targetPercentage: Math.round(targetPercentage)
              },
            },
            trigger: null, // Send immediately
          });

          // Mark as sent for today (except for test notifications)
          if (!isTestTime) {
            await AsyncStorage.setItem(storageKey, 'true');
          }

          console.log(`Snack suggestion sent: ${snackSuggestion.name} (Progress: ${Math.round(avgProgress)}%, Target: ${Math.round(targetPercentage)}%)`);
        }
      } catch (error) {
        console.error('Error in snack suggestion check:', error);
      }
    };

    // Check every minute
    intervalRef.current = setInterval(checkNutritionAndSuggest, 60000);

    // Initial check
    checkNutritionAndSuggest();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedChildId, selectedChildAge, t]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};
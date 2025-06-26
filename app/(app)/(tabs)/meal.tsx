import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { router, useFocusEffect } from 'expo-router';
import { Camera, Search, Plus, Utensils } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { ChildSelector } from '@/components/ChildSelector';
import { MealListItem } from '@/components/MealListItem';
import { MealTypeSelector } from '@/components/MealTypeSelector';
import { Platform } from 'react-native';

type Child = {
  id: string;
  name: string;
};

type Meal = {
  id: string;
  child_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'morning_snack' | 'afternoon_snack';
  food_items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
  photo_url?: string;
};

export default function MealScreen() {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('all');

  // Fetch children when component mounts
  useEffect(() => {
    fetchChildren();
  }, []);

  // Refresh meals when screen comes into focus or when selectedChild/selectedMealType changes
  useFocusEffect(
    useCallback(() => {
      if (selectedChild) {
        fetchMeals();
      }
    }, [selectedChild, selectedMealType])
  );

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('id, name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setChildren(data);
        setSelectedChild(data[0]);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeals = async () => {
    if (!selectedChild) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('meals')
        .select('*')
        .eq('child_id', selectedChild.id)
        .order('created_at', { ascending: false });
      
      if (selectedMealType !== 'all') {
        query = query.eq('meal_type', selectedMealType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setMeals(data || []);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToSupabase = async (uri: string) => {
    try {
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `meal-photos/${fileName}`;
  
      const fileData = Platform.OS === 'android'
        ? { uri, name: fileName, type: `image/${fileExt}` } as unknown as Blob
        : await (async () => {
            const resp = await fetch(uri);
            return resp.blob();
          })();
  
      const { data, error } = await supabase.storage
        .from('meal-photos')
        .upload(filePath, fileData, { contentType: `image/${fileExt}`, upsert: false });
  
      if (error) throw error;
  
      const { data: urlData } = supabase
        .storage
        .from('meal-photos')
        .getPublicUrl(filePath);
  
      return urlData.publicUrl;
  
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err;
    }
  };

  const handleTakePicture = async () => {
    if (!selectedChild) {
      Alert.alert(t('common.error'), t('meal.noChildProfile'));
      return;
    }
    
    try {
      setUploadingImage(true);
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        console.log('Image captured:', result.assets[0].uri);
        
        // Upload image to Supabase Storage
        const publicUrl = await uploadImageToSupabase(result.assets[0].uri);
        
        if (publicUrl) {
          console.log('Image uploaded successfully:', publicUrl);
          
          // Navigate to meal creation form with the public URL
          router.push({
            pathname: '/meal-form',
            params: { 
              childId: selectedChild.id,
              imageUri: publicUrl 
            }
          });
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert(t('common.error'), t('meal.photoUploadFailed'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleManualEntry = () => {
    if (!selectedChild) {
      Alert.alert(t('common.error'), t('meal.noChildProfile'));
      return;
    }
    
    router.push({
      pathname: '/meal-form',
      params: { childId: selectedChild.id }
    });
  };

  const renderEmptyMealList = () => (
    <View style={styles.emptyContainer}>
      <Utensils size={60} color={colors.textLight} />
      <Text style={styles.emptyText}>{t('meal.noMealsRecorded')}</Text>
      <TouchableOpacity 
        style={styles.addMealButton} 
        onPress={handleManualEntry}
      >
        <Text style={styles.addMealButtonText}>{t('meal.addFirstMeal')}</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    sectionTitle: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.text,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    entryButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 12,
      marginHorizontal: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    entryButtonDisabled: {
      opacity: 0.6,
    },
    entryButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.primary,
      marginLeft: spacing.sm,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.textMedium,
      textAlign: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
    addMealButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: 8,
    },
    addMealButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: '#FFFFFF',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mealsList: {
      flex: 1,
    },
    fab: {
      position: 'absolute',
      right: spacing.lg,
      bottom: spacing.lg,
      backgroundColor: colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children.length > 0 ? (
          <>
            <ChildSelector 
              children={children}
              selectedChild={selectedChild}
              onSelectChild={setSelectedChild}
              onAddChild={() => router.push('/add-child')}
            />

            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={[
                  styles.entryButton,
                  uploadingImage && styles.entryButtonDisabled
                ]} 
                onPress={handleTakePicture}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size={20} color={colors.primary} />
                ) : (
                  <Camera size={20} color={colors.primary} />
                )}
                <Text style={styles.entryButtonText}>
                  {uploadingImage ? t('common.uploading') : t('meal.takePicture')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.entryButton} 
                onPress={handleManualEntry}
              >
                <Utensils size={20} color={colors.primary} />
                <Text style={styles.entryButtonText}>{t('meal.manualEntry')}</Text>
              </TouchableOpacity>
            </View>

            <MealTypeSelector
              selectedType={selectedMealType}
              onSelectType={setSelectedMealType}
            />

            <Text style={styles.sectionTitle}>{t('meal.mealHistory')}</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                {meals.length > 0 ? (
                  <FlatList
                    data={meals}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <MealListItem 
                        meal={item} 
                        onPress={() => router.push(`/meal-details/${item.id}`)} 
                      />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: spacing.xxl }}
                  />
                ) : (
                  renderEmptyMealList()
                )}
              </>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('meal.noChildProfile')}</Text>
            <TouchableOpacity 
              style={styles.addMealButton}
              onPress={() => router.push('/add-child')}
            >
              <Text style={styles.addMealButtonText}>{t('meal.addChild')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {children.length > 0 && meals.length > 0 && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleManualEntry}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}
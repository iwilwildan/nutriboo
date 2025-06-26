import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Camera, Plus, Minus, Utensils, Sparkles, X } from 'lucide-react-native';
import { ensureJpeg, segmentImage, nutritionFromImage, getTopDishNames, Macro, extractMacros } from '@/lib/logmeal';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'morning_snack' | 'afternoon_snack';

export default function MealFormScreen() {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  const { session } = useAuth();
  const params = useLocalSearchParams();
  
  const childId = params.childId as string;
  const imageUri = params.imageUri as string;
  
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [foodItems, setFoodItems] = useState<string[]>(['']);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [displayImage, setDisplayImage] = useState<string | null>(null);

  useEffect(() => {
    console.log('imageUri received:', imageUri);
    if (imageUri) {
      console.log('Setting displayImage to:', imageUri);
      setDisplayImage(imageUri);
      analyzePhoto(imageUri);
    }
  }, [imageUri]);

  const analyzePhoto = async (localUri: string) => {
    setAnalyzingPhoto(true);
      try {
      const jpegUri = await ensureJpeg(localUri);
  
      const seg = await segmentImage(jpegUri);
      const topDishNames = getTopDishNames(seg);
      const nutrit = await nutritionFromImage(seg.imageId);
      const macros: Macro = extractMacros(nutrit);
  
      setFoodItems(topDishNames);
      setCalories(String(macros.calories));
      setProtein(String(macros.protein));
      setCarbs(String(macros.carbs));
      setFat(String(macros.fat));
    } catch (err) {
      console.error(err);
      Alert.alert(t('common.error'), t('meal.photoAnalyzeFailed'));
    } finally {
      setAnalyzingPhoto(false);
    }
  };

  const mealTypes: { id: MealType; label: string }[] = [
    { id: 'breakfast', label: t('mealTypes.breakfast') },
    { id: 'morning_snack', label: t('mealTypes.morningSnack') },
    { id: 'lunch', label: t('mealTypes.lunch') },
    { id: 'afternoon_snack', label: t('mealTypes.afternoonSnack') },
    { id: 'dinner', label: t('mealTypes.dinner') },
  ];

  const addFoodItem = () => {
    setFoodItems([...foodItems, '']);
  };

  const removeFoodItem = (index: number) => {
    if (foodItems.length > 1) {
      const newItems = foodItems.filter((_, i) => i !== index);
      setFoodItems(newItems);
    }
  };

  const updateFoodItem = (index: number, value: string) => {
    const newItems = [...foodItems];
    newItems[index] = value;
    setFoodItems(newItems);
  };

  const removePhoto = () => {
    setDisplayImage(null);
    // Reset to manual entry state
    setFoodItems(['']);
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  const handleSave = async () => {
    const filteredFoodItems = foodItems.filter(item => item.trim() !== '');
    
    if (filteredFoodItems.length === 0) {
      Alert.alert(t('common.error'), 'Please add at least one food item.');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('meals')
        .insert([
          {
            child_id: childId,
            meal_type: mealType,
            food_items: filteredFoodItems,
            calories: parseFloat(calories) || 0,
            protein: parseFloat(protein) || 0,
            carbs: parseFloat(carbs) || 0,
            fat: parseFloat(fat) || 0,
            photo_url: displayImage, // Save the public URL to the database
          }
        ]);
      
      if (error) throw error;
      
      router.back();
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert(t('common.error'), 'Failed to save meal. Please try again.');
    } finally {
      setLoading(false);
    }
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
    photoContainer: {
      position: 'relative',
      marginBottom: spacing.xl,
    },
    photoImageContainer: {
      position: 'relative',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    photoImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      resizeMode: 'cover',
    },
    removePhotoButton: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    aiAnalysisContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryLight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      alignSelf: 'center',
    },
    aiAnalysisText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: '#FFFFFF',
      marginLeft: spacing.sm,
    },
    sectionTitle: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.text,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
    },
    mealTypeContainer: {
      marginBottom: spacing.xl,
    },
    mealTypeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    mealTypeButton: {
      width: '48%',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    selectedMealType: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    mealTypeText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
    },
    selectedMealTypeText: {
      color: '#FFFFFF',
    },
    foodItemsContainer: {
      marginBottom: spacing.xl,
    },
    foodItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    foodItemInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.text,
      marginRight: spacing.sm,
    },
    removeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addFoodButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: spacing.md,
      marginTop: spacing.sm,
    },
    addFoodButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.primary,
      marginLeft: spacing.sm,
    },
    nutritionContainer: {
      marginBottom: spacing.xl,
    },
    nutritionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    nutritionInputContainer: {
      width: '48%',
      marginBottom: spacing.md,
    },
    nutritionLabel: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
      marginBottom: spacing.xs,
    },
    nutritionInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      color: colors.text,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.md,
    },
    saveButtonText: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.md,
      color: '#FFFFFF',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      padding: spacing.lg,
    },
    loadingText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.textMedium,
      marginTop: spacing.md,
      textAlign: 'center',
    },
    loadingDescription: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.textLight,
      marginTop: spacing.sm,
      textAlign: 'center',
      lineHeight: typography.fontSize.sm * 1.4,
    },
  });

  const handleImageError = (error: any) => {
    console.error('Image loading error:', error);
    console.log('Failed to load image URI:', displayImage);
    Alert.alert(t('common.error'), 'Failed to load image. Please try again.');
  };

  if (analyzingPhoto) {
    return (
      <View style={styles.loadingContainer}>
        <Sparkles size={48} color={colors.primary} />
        <Text style={styles.loadingText}>
          {t('mealForm.analyzingPhoto')}
        </Text>
        <Text style={styles.loadingDescription}>
          {t('mealForm.aiAnalysisDescription')}
        </Text>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {displayImage && (
          <View style={styles.photoContainer}>
            <View style={styles.photoImageContainer}>
              <Image 
                source={{ uri: displayImage }} 
                style={styles.photoImage}
                onError={handleImageError}
              />
              <TouchableOpacity 
                style={styles.removePhotoButton}
                onPress={removePhoto}
              >
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.aiAnalysisContainer}>
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={styles.aiAnalysisText}>
                {t('mealForm.aiAnalyzed')}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.mealTypeContainer}>
          <Text style={styles.sectionTitle}>{t('mealForm.mealType')}</Text>
          <View style={styles.mealTypeGrid}>
            {mealTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.mealTypeButton,
                  mealType === type.id && styles.selectedMealType
                ]}
                onPress={() => setMealType(type.id)}
              >
                <Text style={[
                  styles.mealTypeText,
                  mealType === type.id && styles.selectedMealTypeText
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.foodItemsContainer}>
          <Text style={styles.sectionTitle}>{t('mealForm.foodItems')}</Text>
          {foodItems.map((item, index) => (
            <View key={index} style={styles.foodItemRow}>
              <TextInput
                style={styles.foodItemInput}
                value={item}
                onChangeText={(value) => updateFoodItem(index, value)}
                placeholder={t('mealForm.foodItemPlaceholder')}
                placeholderTextColor={colors.textLight}
              />
              {foodItems.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFoodItem(index)}
                >
                  <Minus size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          <TouchableOpacity style={styles.addFoodButton} onPress={addFoodItem}>
            <Plus size={20} color={colors.primary} />
            <Text style={styles.addFoodButtonText}>
              {t('mealForm.addFoodItem')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.nutritionContainer}>
          <Text style={styles.sectionTitle}>{t('mealForm.nutritionInfo')}</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionInputContainer}>
              <Text style={styles.nutritionLabel}>{t('nutrition.calories')}</Text>
              <TextInput
                style={styles.nutritionInput}
                value={calories}
                onChangeText={setCalories}
                placeholder="0"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.nutritionInputContainer}>
              <Text style={styles.nutritionLabel}>{t('nutrition.protein')} (g)</Text>
              <TextInput
                style={styles.nutritionInput}
                value={protein}
                onChangeText={setProtein}
                placeholder="0"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.nutritionInputContainer}>
              <Text style={styles.nutritionLabel}>{t('nutrition.carbs')} (g)</Text>
              <TextInput
                style={styles.nutritionInput}
                value={carbs}
                onChangeText={setCarbs}
                placeholder="0"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.nutritionInputContainer}>
              <Text style={styles.nutritionLabel}>{t('nutrition.fat')} (g)</Text>
              <TextInput
                style={styles.nutritionInput}
                value={fat}
                onChangeText={setFat}
                placeholder="0"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
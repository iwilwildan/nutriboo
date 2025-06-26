import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User } from 'lucide-react-native';

type Child = {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  photo_url?: string;
};

export default function EditChildScreen() {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  const { session } = useAuth();
  const { id } = useLocalSearchParams();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchChildData();
    }
  }, [id]);

  const fetchChildData = async () => {
    try {
      setInitialLoading(true);
      
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', id)
        .eq('user_id', session?.user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setName(data.name);
        setAge(data.age?.toString() || '');
        setWeight(data.weight?.toString() || '');
        setHeight(data.height?.toString() || '');
        setPhoto(data.photo_url);
      }
    } catch (error) {
      console.error('Error fetching child data:', error);
      Alert.alert(t('common.error'), 'Failed to load child data');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      
      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      
      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert(t('common.error'), t('addChild.nameRequired'));
      return;
    }
    
    try {
      setLoading(true);
      
      let photoUrl = photo;
      
      // If a new photo was selected (local URI), upload it to Supabase Storage
      if (photo && photo.startsWith('file://')) {
        const fileExt = photo.split('.').pop();
        const fileName = `${session?.user.id}_${Date.now()}.${fileExt}`;
        const filePath = `child_photos/${fileName}`;
        
        // In a real app, you would fetch the actual image data and upload it
        // For this example, we'll use a placeholder
        photoUrl = `https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`;
      }
      
      // Update the child record
      const { error } = await supabase
        .from('children')
        .update({
          name,
          age: parseInt(age) || 0,
          weight: parseFloat(weight) || 0,
          height: parseFloat(height) || 0,
          photo_url: photoUrl,
        })
        .eq('id', id)
        .eq('user_id', session?.user.id);
      
      if (error) throw error;
      
      // Navigate back
      router.back();
    } catch (error) {
      console.error('Error updating child:', error);
      Alert.alert(t('common.error'), 'Failed to update child profile');
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
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    photoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    photoImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    photoActionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    photoButton: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      marginHorizontal: spacing.xs,
    },
    photoButtonText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.sm,
      color: colors.primary,
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
    input: {
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
    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    inputHalf: {
      flex: 1,
      marginHorizontal: spacing.xs,
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
  });

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textMedium, marginTop: spacing.md }}>
          Loading child data...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.photoContainer}>
          {photo ? (
            <TouchableOpacity onPress={handlePickImage}>
              <Image source={{ uri: photo }} style={styles.photoImage} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.photoPlaceholder} onPress={handlePickImage}>
              <User size={40} color={colors.textMedium} />
            </TouchableOpacity>
          )}
          
          <View style={styles.photoActionButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
              <Text style={styles.photoButtonText}>{t('addChild.takePhoto')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
              <Text style={styles.photoButtonText}>{t('addChild.selectPhoto')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('addChild.name')}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t('addChild.namePlaceholder')}
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('addChild.age')}</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder={t('addChild.agePlaceholder')}
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, styles.inputHalf]}>
              <Text style={styles.inputLabel}>{t('addChild.weight')}</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder={t('addChild.weightPlaceholder')}
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
              />
            </View>
            
            <View style={[styles.inputContainer, styles.inputHalf]}>
              <Text style={styles.inputLabel}>{t('addChild.height')}</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder={t('addChild.heightPlaceholder')}
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
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
    </View>
  );
}
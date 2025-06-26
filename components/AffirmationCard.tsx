import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Heart, Share2 } from 'lucide-react-native';

// List of affirmations in English and Bahasa Indonesia
const affirmations = {
  en: [
    "You're doing an amazing job caring for your child's nutrition.",
    "Every healthy meal you provide is an act of love.",
    "Your dedication to your child's growth makes a lifetime of difference.",
    "Small nutritional choices today create big health benefits tomorrow.",
    "You have the power to nurture both body and mind through food.",
    "Your commitment to your child's health is inspiring.",
    "Patience with picky eaters pays off in healthy habits.",
    "You're building the foundation for a lifetime of health.",
    "Every nutritious bite is a step toward a healthier future.",
    "Your love shows in every balanced meal you prepare."
  ],
  id: [
    "Anda melakukan pekerjaan yang luar biasa dalam menjaga nutrisi anak Anda.",
    "Setiap makanan sehat yang Anda berikan adalah tindakan kasih sayang.",
    "Dedikasi Anda untuk pertumbuhan anak membuat perbedaan seumur hidup.",
    "Pilihan nutrisi kecil hari ini menciptakan manfaat kesehatan besar besok.",
    "Anda memiliki kekuatan untuk memelihara tubuh dan pikiran melalui makanan.",
    "Komitmen Anda terhadap kesehatan anak sangat menginspirasi.",
    "Kesabaran dengan anak yang pilih-pilih makanan akan membuahkan kebiasaan sehat.",
    "Anda sedang membangun fondasi untuk kesehatan seumur hidup.",
    "Setiap gigitan bergizi adalah langkah menuju masa depan yang lebih sehat.",
    "Kasih sayang Anda terlihat dalam setiap makanan seimbang yang Anda siapkan."
  ]
};

export function AffirmationCard() {
  const { colors, spacing, typography } = useTheme();
  const { t, locale } = useLanguage();
  const [affirmation, setAffirmation] = useState<string>('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // Get a random affirmation based on the current language
    const randomIndex = Math.floor(Math.random() * affirmations[locale === 'id' ? 'id' : 'en'].length);
    setAffirmation(affirmations[locale === 'id' ? 'id' : 'en'][randomIndex]);
  }, [locale]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${affirmation}" - Shared from Nutriboo App`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: spacing.lg,
      marginVertical: spacing.md,
    },
    title: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: '#FFFFFF',
      marginBottom: spacing.sm,
    },
    affirmation: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.lg,
      color: '#FFFFFF',
      marginBottom: spacing.md,
      lineHeight: typography.fontSize.lg * typography.lineHeight.body,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('affirmation.dailyAffirmation')}</Text>
      <Text style={styles.affirmation}>{affirmation}</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setLiked(!liked)}
        >
          <Heart 
            size={18} 
            color="#FFFFFF" 
            fill={liked ? '#FFFFFF' : 'transparent'} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Share2 size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
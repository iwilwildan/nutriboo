import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { router } from 'expo-router';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { supabase } from '@/lib/supabase';
import { ChildSelector } from '@/components/ChildSelector';
import { ProgressTimeSelector } from '@/components/ProgressTimeSelector';

type Child = {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  created_at: string;
};

type NutritionData = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function ProgressScreen() {
  const { colors, spacing, typography } = useTheme();
  const { t, locale } = useLanguage();
  const screenWidth = Dimensions.get('window').width - (spacing.lg * 2);

  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [nutritionData, setNutritionData] = useState<NutritionData[]>([]);
  const [growthData, setGrowthData] = useState<{
    weights: number[];
    heights: number[];
    dates: string[];
  }>({ weights: [], heights: [], dates: [] });

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchNutritionData();
      fetchGrowthData();
    }
  }, [selectedChild, timeRange]);

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: false });
      
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

  const fetchNutritionData = async () => {
    if (!selectedChild) return;
    
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      if (timeRange === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else {
        startDate.setMonth(endDate.getMonth() - 1);
      }
      
      // Fetch meal data from Supabase
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('child_id', selectedChild.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      // Process data for charts
      const processedData = aggregateNutritionByDay(data || []);
      setNutritionData(processedData);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrowthData = async () => {
    if (!selectedChild) return;
    
    try {
      // Generate dates (last 4 months)
      const dates = [];
      const today = new Date();
      for (let i = 3; i >= 0; i--) {
        const date = new Date();
        date.setMonth(today.getMonth() - i);
        dates.push(date.toLocaleDateString(locale, { month: 'short' }));
      }

      // In a real app, you would fetch growth measurements from a separate table
      // For this example, we'll generate mock data
      const weights = [selectedChild.weight - 0.3, selectedChild.weight - 0.2, selectedChild.weight - 0.1, selectedChild.weight];
      const heights = [selectedChild.height - 0.5, selectedChild.height - 0.3, selectedChild.height - 0.2, selectedChild.height];
      
      setGrowthData({ weights, heights, dates });
    } catch (error) {
      console.error('Error fetching growth data:', error);
    }
  };

  const aggregateNutritionByDay = (meals: any[]) => {
    const aggregated: Record<string, NutritionData> = {};

    meals.forEach(meal => {
      // use a guaranteed ISO key: YYYY-MM-DD
      const isoKey = meal.created_at.split('T')[0];      // "2025-06-05"
  
      if (!aggregated[isoKey]) {
        aggregated[isoKey] = { date: isoKey, calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      aggregated[isoKey].calories += meal.calories ?? 0;
      aggregated[isoKey].protein  += meal.protein  ?? 0;
      aggregated[isoKey].carbs    += meal.carbs    ?? 0;
      aggregated[isoKey].fat      += meal.fat      ?? 0;
    });
  
    // return **chronologically sorted** array
    return Object.values(aggregated).sort((a, b) => a.date.localeCompare(b.date));
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.lg,
    },
    sectionTitle: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.lg,
      color: colors.text,
      marginBottom: spacing.sm,
      marginTop: spacing.lg,
    },
    chartContainer: {
      marginVertical: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      alignItems: 'center',
    },
    chartTitle: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.text,
      marginBottom: spacing.md,
    },
    noDataContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginVertical: spacing.lg,
    },
    noDataText: {
      fontFamily: typography.fontFamily.semiBold,
      fontSize: typography.fontSize.md,
      color: colors.textMedium,
      textAlign: 'center',
      marginBottom: spacing.md,
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
      minHeight: 200,
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginTop: spacing.md,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.md,
      marginBottom: spacing.sm,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: spacing.xs,
    },
    legendText: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      color: colors.textMedium,
    },
  });

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: () => colors.text,
  };

  const renderCalorieChart = () => {
    if (nutritionData.length === 0) return null;
    
    const data = {
      labels: nutritionData.map(item => {
        const [y, m, d] = item.date.split('-');              // ["2025","06","05"]
        const jsDate = new Date(Number(y), Number(m) - 1, Number(d));
        return jsDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          data: nutritionData.map(item => item.calories),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
    if (data.datasets[0].data.length === 1) {
      data.labels.unshift('');
      data.datasets[0].data.unshift(0);
    }
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{t('progress.caloriesOverTime')}</Text>
        <LineChart
          data={data}
          width={screenWidth - (spacing.md * 2)}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{ borderRadius: 8 }}
        />
      </View>
    );
  };

  const renderMacronutrientChart = () => {
    if (nutritionData.length === 0) return null;
    
    // Sum up all macronutrients for the period
    const totalProtein = nutritionData.reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = nutritionData.reduce((sum, item) => sum + item.carbs, 0);
    const totalFat = nutritionData.reduce((sum, item) => sum + item.fat, 0);
    
    const data = {
      labels: [t('nutrition.protein'), t('nutrition.carbs'), t('nutrition.fat')],
      datasets: [
        {
          data: [totalProtein, totalCarbs, totalFat],
          colors: [
            (opacity = 1) => `rgba(41, 182, 246, ${opacity})`,
            (opacity = 1) => `rgba(255, 167, 38, ${opacity})`,
            (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
          ]
        }
      ]
    };
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{t('progress.macroDistribution')}</Text>
        <BarChart
          data={data}
          width={screenWidth - (spacing.md * 2)}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1, index) => {
              const colors = [
                `rgba(41, 182, 246, ${opacity})`,
                `rgba(255, 167, 38, ${opacity})`,
                `rgba(244, 67, 54, ${opacity})`,
              ];
              return colors[index] || colors[0];
            },
          }}
          style={{ borderRadius: 8 }}
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#29B6F6' }]} />
            <Text style={styles.legendText}>{t('nutrition.protein')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFA726' }]} />
            <Text style={styles.legendText}>{t('nutrition.carbs')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>{t('nutrition.fat')}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderGrowthChart = () => {
    if (growthData.weights.length === 0) return null;
    
    const data = {
      labels: growthData.dates,
      datasets: [
        {
          data: growthData.weights,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
    if (data.datasets[0].data.length === 1) {
      data.labels.unshift('');
      data.datasets[0].data.unshift(0);
    }
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{t('progress.weightOverTime')}</Text>
        <LineChart
          data={data}
          width={screenWidth - (spacing.md * 2)}
          height={220}
          chartConfig={{...chartConfig, decimalPlaces: 1}}
          bezier
          style={{ borderRadius: 8 }}
          yAxisSuffix=" kg"
        />
      </View>
    );
  };

  const renderHeightChart = () => {
    if (growthData.heights.length === 0) return null;
    
    const data = {
      labels: growthData.dates,
      datasets: [
        {
          data: growthData.heights,
          color: (opacity = 1) => `rgba(41, 182, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
    if (data.datasets[0].data.length === 1) {
      data.labels.unshift('');
      data.datasets[0].data.unshift(0);
    }
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{t('progress.heightOverTime')}</Text>
        <LineChart
          data={data}
          width={screenWidth - (spacing.md * 2)}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(41, 182, 246, ${opacity})`,
            decimalPlaces: 1,
          }}
          bezier
          style={{ borderRadius: 8 }}
          yAxisSuffix=" cm"
        />
      </View>
    );
  };

  const renderNoData = () => (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>{t('progress.noDataAvailable')}</Text>
      <TouchableOpacity 
        style={styles.addMealButton}
        onPress={() => router.push('/meal')}
      >
        <Text style={styles.addMealButtonText}>{t('progress.startTracking')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {children.length > 0 ? (
          <>
            <ChildSelector 
              children={children}
              selectedChild={selectedChild}
              onSelectChild={setSelectedChild}
              onAddChild={() => router.push('/add-child')}
            />

            <ProgressTimeSelector
              selectedRange={timeRange}
              onSelectRange={setTimeRange}
            />

            <Text style={styles.sectionTitle}>{t('progress.nutritionProgress')}</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                {nutritionData.length > 0 ? (
                  <>
                    {renderCalorieChart()}
                    {renderMacronutrientChart()}
                  </>
                ) : (
                  renderNoData()
                )}
              </>
            )}

            <Text style={styles.sectionTitle}>{t('progress.growthProgress')}</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                {growthData.weights.length > 0 ? (
                  <>
                    {renderGrowthChart()}
                    {renderHeightChart()}
                  </>
                ) : (
                  renderNoData()
                )}
              </>
            )}
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>{t('progress.noChildProfile')}</Text>
            <TouchableOpacity 
              style={styles.addMealButton}
              onPress={() => router.push('/add-child')}
            >
              <Text style={styles.addMealButtonText}>{t('progress.addChild')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
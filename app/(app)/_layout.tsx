import React, { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function AppLayout() {
  const { session, isLoading } = useAuth();

  // If the user is not authenticated, redirect to the login screen
  if (!isLoading && !session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-child" options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'Add Child' 
        }} />
        <Stack.Screen name="edit-child/[id]" options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'Edit Child' 
        }} />
        <Stack.Screen name="meal-form" options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'Add Meal' 
        }} />
      </Stack>
    </SafeAreaProvider>
  );
}
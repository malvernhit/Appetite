import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProvider, useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
} from '@expo-google-fonts/nunito-sans';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { theme, session, isLoading, user } = useApp();
  const router = useRouter();
  const segments = useSegments();
  const [userMode, setUserMode] = React.useState<string | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('users')
        .select('user_mode')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          setUserMode(data?.user_mode || null);
        });
    } else {
      setUserMode(null);
    }
  }, [user]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'restaurant' || segments[0] === 'restaurant-dashboard' || segments[0] === 'cart' || segments[0] === 'delivery' || segments[0] === 'chat' || segments[0] === 'tracking';

    if (!session && inAuthGroup) {
      router.replace('/signin');
    } else if (session && (segments[0] === 'signin' || segments[0] === 'signup')) {
      if (userMode === 'restaurant') {
        router.replace('/restaurant-dashboard');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [session, segments, isLoading, userMode]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="restaurant/[id]" />
        <Stack.Screen name="restaurant-dashboard" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="delivery" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="tracking" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    'NunitoSans-Regular': NunitoSans_400Regular,
    'NunitoSans-SemiBold': NunitoSans_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

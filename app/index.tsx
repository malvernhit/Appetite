import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';

export default function SplashScreen() {
  const router = useRouter();
  const { session, isLoading } = useApp();

  useEffect(() => {
    if (!isLoading) {
      checkAuth();
    }
  }, [isLoading]);

  const checkAuth = async () => {
    setTimeout(() => {
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/signin');
      }
    }, 1500);
  };

  return (
    <LinearGradient colors={[Colors.primary, '#FF7A50']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🍽️</Text>
        <Text style={styles.title}>Appetite</Text>
        <Text style={styles.tagline}>Your food, delivered fast</Text>
        <ActivityIndicator color={Colors.white} size="large" style={styles.loader} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.headline,
    fontSize: 48,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.body,
    color: Colors.white,
    opacity: 0.9,
  },
  loader: {
    marginTop: Spacing.xxxl,
  },
});

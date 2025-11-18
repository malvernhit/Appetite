import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useThemedColors } from '@/hooks/useThemedColors';
import DishCard from '@/components/DishCard';
import FloatingCartButton from '@/components/FloatingCartButton';
import { mockRestaurants, mockDishes } from '@/data/mockData';

export default function RestaurantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { cart, addToCart, removeFromCart } = useApp();
  const colors = useThemedColors();

  const restaurant = mockRestaurants.find((r) => r.id === id);
  const dishes = mockDishes[id as string] || [];

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (dish: any, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(dish.id);
    } else {
      const existingItem = cart.find((item) => item.dish.id === dish.id);
      if (existingItem) {
        removeFromCart(dish.id);
      }
      if (quantity > 0) {
        addToCart({ dish, quantity });
      }
    }
  };

  const getDishQuantity = (dishId: string) => {
    return cart.find((item) => item.dish.id === dishId)?.quantity || 0;
  };

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Restaurant not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri: restaurant.image }} style={styles.image} />
        <View style={[styles.info, { backgroundColor: colors.card }]}>
          <Text style={[styles.name, { color: colors.text }]}>{restaurant.name}</Text>
          <View style={styles.meta}>
            <View style={styles.rating}>
              <Star size={16} color={Colors.accent} fill={Colors.accent} />
              <Text style={[styles.ratingText, { color: colors.text }]}>{restaurant.rating}</Text>
            </View>
            <Text style={[styles.metaText, { color: colors.muted }]}>{restaurant.cuisine}</Text>
            <Text style={[styles.metaText, { color: colors.muted }]}>{restaurant.deliveryTime}</Text>
          </View>
        </View>

        <View style={styles.dishesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Menu</Text>
          {dishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onQuantityChange={(quantity) => handleQuantityChange(dish, quantity)}
              currentQuantity={getDishQuantity(dish.id)}
            />
          ))}
        </View>
      </ScrollView>

      <FloatingCartButton itemCount={cartItemCount} onPress={() => router.push('/cart')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 250,
  },
  info: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  name: {
    ...Typography.headline,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },
  metaText: {
    ...Typography.body,
    color: Colors.dark.muted,
  },
  dishesSection: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.subheadline,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
});

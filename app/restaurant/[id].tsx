import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useThemedColors } from '@/hooks/useThemedColors';
import DishCard from '@/components/DishCard';
import FloatingCartButton from '@/components/FloatingCartButton';
import { Restaurant, Dish } from '@/types';
import { restaurantService } from '@/services/restaurantService';
import { dishService } from '@/services/dishService';

export default function RestaurantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { cart, addToCart, removeFromCart } = useApp();
  const colors = useThemedColors();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRestaurantData();
  }, [id]);

  const loadRestaurantData = async () => {
    try {
      setIsLoading(true);
      const restaurantData = await restaurantService.getRestaurantById(id as string);
      setRestaurant(restaurantData);

      if (restaurantData) {
        const dishData = await dishService.getDishesByRestaurant(restaurantData.id);
        setDishes(dishData);
      }
    } catch (error) {
      console.error('Error loading restaurant:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Restaurant not found</Text>
        </View>
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
        <Image source={{ uri: restaurant.image_url || 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg' }} style={styles.image} />
        <View style={[styles.info, { backgroundColor: colors.card }]}>
          <Text style={[styles.name, { color: colors.text }]}>{restaurant.name}</Text>
          <View style={styles.meta}>
            <View style={styles.rating}>
              <Star size={16} color={Colors.accent} fill={Colors.accent} />
              <Text style={[styles.ratingText, { color: colors.text }]}>{restaurant.rating}</Text>
            </View>
            <Text style={[styles.metaText, { color: colors.muted }]}>{restaurant.cuisine}</Text>
            <Text style={[styles.metaText, { color: colors.muted }]}>{restaurant.delivery_time}</Text>
          </View>
        </View>

        <View style={styles.dishesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Menu</Text>
          {dishes.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.muted }]}>No dishes available</Text>
          ) : (
            dishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onQuantityChange={(quantity) => handleQuantityChange(dish, quantity)}
                currentQuantity={getDishQuantity(dish.id)}
              />
            ))
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.body,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
    marginVertical: Spacing.lg,
  },
});

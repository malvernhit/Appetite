import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { Colors, Typography, Shadows, BorderRadius, Spacing } from '@/constants/theme';
import { Dish } from '@/types';
import { useThemedColors } from '@/hooks/useThemedColors';

interface DishCardProps {
  dish: Dish;
  onQuantityChange: (quantity: number) => void;
  currentQuantity?: number;
}

export default function DishCard({ dish, onQuantityChange, currentQuantity = 0 }: DishCardProps) {
  const [quantity, setQuantity] = useState(currentQuantity);
  const colors = useThemedColors();

  useEffect(() => {
    setQuantity(currentQuantity);
  }, [currentQuantity]);

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Image source={{ uri: dish.image_url || 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg' }} style={styles.image} />
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {dish.name}
        </Text>
        <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>
          {dish.description}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${dish.price.toFixed(2)}</Text>

          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleIncrease}
              activeOpacity={0.8}
            >
              <Plus size={20} color={Colors.white} strokeWidth={3} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.quantityContainer, { backgroundColor: colors.background }]}>
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: colors.card }]}
                onPress={handleDecrease}
                activeOpacity={0.8}
              >
                <Minus size={16} color={Colors.primary} strokeWidth={3} />
              </TouchableOpacity>
              <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.quantityButton, { backgroundColor: colors.card }]}
                onPress={handleIncrease}
                activeOpacity={0.8}
              >
                <Plus size={16} color={Colors.primary} strokeWidth={3} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.caption,
    color: Colors.dark.muted,
    marginBottom: Spacing.md,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    ...Typography.subheadline,
    color: Colors.primary,
    fontWeight: '700',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.button,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.round,
    paddingVertical: 4,
    paddingHorizontal: 4,
    ...Shadows.button,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    fontWeight: '700',
    marginHorizontal: Spacing.md,
    minWidth: 20,
    textAlign: 'center',
  },
});

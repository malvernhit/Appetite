import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star, Clock, MapPin } from 'lucide-react-native';
import { Colors, Typography, Shadows, BorderRadius, Spacing } from '@/constants/theme';
import { useThemedColors } from '@/hooks/useThemedColors';

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    cuisine: string;
    rating: number;
    distance: number;
    deliveryTime: string;
    image: string;
    isOpen: boolean;
  };
  onPress: () => void;
}

export default function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
  const colors = useThemedColors();

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: restaurant.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]}>{restaurant.name}</Text>
        <Text style={[styles.cuisine, { color: colors.muted }]}>{restaurant.cuisine}</Text>
        <View style={styles.info}>
          <View style={styles.infoItem}>
            <Star size={14} color={Colors.accent} fill={Colors.accent} />
            <Text style={[styles.infoText, { color: colors.text }]}>{restaurant.rating}</Text>
          </View>
          <View style={styles.infoItem}>
            <MapPin size={14} color={colors.text} />
            <Text style={[styles.infoText, { color: colors.text }]}>{restaurant.distance} km</Text>
          </View>
          <View style={styles.infoItem}>
            <Clock size={14} color={colors.text} />
            <Text style={[styles.infoText, { color: colors.text }]}>{restaurant.deliveryTime}</Text>
          </View>
        </View>
        {!restaurant.isOpen && (
          <View style={styles.closedBadge}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
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
    height: 180,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  content: {
    padding: Spacing.lg,
  },
  name: {
    ...Typography.subheadline,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  cuisine: {
    ...Typography.body,
    color: Colors.dark.muted,
    marginBottom: Spacing.md,
  },
  info: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.text,
  },
  closedBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  closedText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
});

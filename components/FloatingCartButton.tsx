import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { Colors, Typography, Shadows, BorderRadius, Spacing } from '@/constants/theme';

interface FloatingCartButtonProps {
  itemCount: number;
  onPress: () => void;
}

export default function FloatingCartButton({ itemCount, onPress }: FloatingCartButtonProps) {
  if (itemCount === 0) return null;

  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.9}>
      <ShoppingBag size={24} color={Colors.white} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{itemCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.floating,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '700',
  },
});

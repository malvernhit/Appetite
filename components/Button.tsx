import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Shadows, BorderRadius } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return Colors.neutral;
    switch (variant) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.white;
      case 'success':
        return Colors.success;
      default:
        return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#999';
    return variant === 'secondary' ? Colors.primary : Colors.white;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'secondary' && styles.secondaryBorder,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...Shadows.button,
  },
  secondaryBorder: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
    ...Shadows.button,
  },
});

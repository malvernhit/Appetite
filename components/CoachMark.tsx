import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { X } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useThemedColors } from '@/hooks/useThemedColors';

interface CoachMarkProps {
  visible: boolean;
  onDismiss: () => void;
  targetY?: number;
}

export default function CoachMark({ visible, onDismiss, targetY = 120 }: CoachMarkProps) {
  const colors = useThemedColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss} />

      <View style={[styles.arrowContainer, { top: targetY + 20 }]}>
        <Svg width="120" height="100" viewBox="0 0 120 100" style={styles.arrow}>
          <Path
            d="M 10 90 Q 30 20, 80 10"
            stroke={Colors.primary}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 80 10 L 70 5 L 75 15 Z"
            fill={Colors.primary}
          />
        </Svg>
      </View>

      <Animated.View
        style={[
          styles.tooltip,
          {
            top: targetY + 100,
            backgroundColor: colors.card,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
          <X size={20} color={colors.muted} />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>📍</Text>
          </View>
        </Animated.View>

        <Text style={[styles.title, { color: colors.text }]}>Pick Your Location</Text>
        <Text style={[styles.description, { color: colors.muted }]}>
          Tap the location selector above to set your delivery address and find restaurants near
          you
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onDismiss}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Got it!</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  arrowContainer: {
    position: 'absolute',
    left: 20,
    zIndex: 1001,
  },
  arrow: {
    opacity: 0.9,
  },
  tooltip: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.floating,
    zIndex: 1002,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    ...Typography.headline,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    ...Shadows.button,
  },
  buttonText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },
});

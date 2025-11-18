import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Heart } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useThemedColors } from '@/hooks/useThemedColors';

export default function FavoritesScreen() {
  const colors = useThemedColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
      </View>
      <View style={styles.content}>
        <Heart size={48} color={colors.muted} />
        <Text style={[styles.emptyText, { color: colors.text }]}>No favorites yet</Text>
        <Text style={[styles.emptySubtext, { color: colors.muted }]}>Save your favorite restaurants and dishes</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral,
  },
  title: {
    ...Typography.headline,
    color: Colors.text,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.subheadline,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.dark.muted,
    textAlign: 'center',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, SlidersHorizontal, X } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useThemedColors } from '@/hooks/useThemedColors';
import RestaurantCard from '@/components/RestaurantCard';
import FloatingCartButton from '@/components/FloatingCartButton';
import Button from '@/components/Button';
import CoachMark from '@/components/CoachMark';
import LocationPickerModal from '@/components/LocationPickerModal';
import { mockRestaurants, mockAddress } from '@/data/mockData';

type FilterType = 'all' | 'rating' | 'distance' | 'open';

export default function HomeScreen() {
  const router = useRouter();
  const { cart, userMode } = useApp();
  const colors = useThemedColors();
  const [allRestaurants] = useState(mockRestaurants);
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showCoachMark, setShowCoachMark] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(mockAddress);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyFilter = (filter: FilterType) => {
    let filtered = [...allRestaurants];

    switch (filter) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'open':
        filtered = filtered.filter((r) => r.isOpen);
        break;
      default:
        break;
    }

    setRestaurants(filtered);
    setActiveFilter(filter);
    setShowFilterModal(false);
  };

  if (userMode === 'biker') {
    router.replace('/tracking');
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={() => setShowLocationModal(true)}
        >
          <MapPin size={20} color={Colors.primary} />
          <View style={styles.locationText}>
            <Text style={[styles.locationLabel, { color: colors.muted }]}>Delivering to</Text>
            <Text style={[styles.locationAddress, { color: colors.text }]}>{selectedLocation}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.neutral }]}
          onPress={() => setShowFilterModal(true)}
        >
          <SlidersHorizontal size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Restaurants Near You</Text>
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onPress={() => router.push(`/restaurant/${restaurant.id}`)}
          />
        ))}
      </ScrollView>

      <FloatingCartButton itemCount={cartItemCount} onPress={() => router.push('/cart')} />

      <CoachMark visible={showCoachMark} onDismiss={() => setShowCoachMark(false)} targetY={60} />

      <LocationPickerModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={(location) => setSelectedLocation(location)}
        currentLocation={selectedLocation}
      />

      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Restaurants</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.filterOption, { backgroundColor: colors.background }, activeFilter === 'all' && styles.filterOptionActive]}
              onPress={() => applyFilter('all')}
            >
              <Text style={[styles.filterOptionText, { color: colors.text }, activeFilter === 'all' && styles.filterOptionTextActive]}>
                All Restaurants
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, { backgroundColor: colors.background }, activeFilter === 'rating' && styles.filterOptionActive]}
              onPress={() => applyFilter('rating')}
            >
              <Text style={[styles.filterOptionText, { color: colors.text }, activeFilter === 'rating' && styles.filterOptionTextActive]}>
                Sort by Rating
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, { backgroundColor: colors.background }, activeFilter === 'distance' && styles.filterOptionActive]}
              onPress={() => applyFilter('distance')}
            >
              <Text style={[styles.filterOptionText, { color: colors.text }, activeFilter === 'distance' && styles.filterOptionTextActive]}>
                Sort by Distance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, { backgroundColor: colors.background }, activeFilter === 'open' && styles.filterOptionActive]}
              onPress={() => applyFilter('open')}
            >
              <Text style={[styles.filterOptionText, { color: colors.text }, activeFilter === 'open' && styles.filterOptionTextActive]}>
                Open Now Only
              </Text>
            </TouchableOpacity>

            <Button
              title="Close"
              onPress={() => setShowFilterModal(false)}
              variant="secondary"
              style={styles.closeButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  locationLabel: {
    ...Typography.caption,
    color: Colors.dark.muted,
  },
  locationAddress: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.neutral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  title: {
    ...Typography.headline,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    ...Shadows.floating,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    ...Typography.subheadline,
    color: Colors.text,
  },
  filterOption: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    marginBottom: Spacing.md,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
  },
  filterOptionText: {
    ...Typography.body,
    color: Colors.text,
  },
  filterOptionTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: Spacing.lg,
  },
});

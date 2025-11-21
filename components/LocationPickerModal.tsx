import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Location from 'expo-location';
import { X, MapPin, Search, Locate } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useThemedColors } from '@/hooks/useThemedColors';
import StaticMapView from './StaticMapView';
import InteractiveMapView from './InteractiveMapView';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: string, latitude?: number, longitude?: number) => void;
  currentLocation?: string;
}

export default function LocationPickerModal({
  visible,
  onClose,
  onSelectLocation,
  currentLocation,
}: LocationPickerModalProps) {
  const colors = useThemedColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);

  const suggestedLocations = [
    { name: 'Times Square, New York', lat: 40.758, lng: -73.9855 },
    { name: 'Central Park, New York', lat: 40.7829, lng: -73.9654 },
    { name: 'Brooklyn Bridge, New York', lat: 40.7061, lng: -73.9969 },
    { name: 'Empire State Building, New York', lat: 40.7484, lng: -73.9857 },
    { name: 'Manhattan, New York', lat: 40.7831, lng: -73.9712 },
  ];

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to use your current location.',
          [{ text: 'OK' }]
        );
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      let formattedAddress = 'Current Location';
      if (address) {
        const parts = [];
        if (address.streetNumber) parts.push(address.streetNumber);
        if (address.street) parts.push(address.street);
        if (address.city) parts.push(address.city);
        if (address.region) parts.push(address.region);
        if (address.postalCode) parts.push(address.postalCode);
        formattedAddress = parts.join(', ') || 'Current Location';
      }

      setSelectedLocation({
        name: formattedAddress,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your current location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSelectLocationFromList = (location: { name: string; lat: number; lng: number }) => {
    setSelectedLocation(location);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation.name, selectedLocation.lat, selectedLocation.lng);
      onClose();
      setSelectedLocation(null);
    }
  };

  const handleClose = () => {
    setSelectedLocation(null);
    onClose();
  };

  const filteredLocations = searchQuery
    ? suggestedLocations.filter((location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : suggestedLocations;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Choose Location
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedLocation && (
            <View style={styles.mapPreviewContainer}>
              {Platform.OS === 'web' ? (
                <InteractiveMapView
                  latitude={selectedLocation.lat}
                  longitude={selectedLocation.lng}
                  width={Dimensions.get('window').width - 48}
                  height={250}
                  zoom={14}
                />
              ) : (
                <StaticMapView
                  latitude={selectedLocation.lat}
                  longitude={selectedLocation.lng}
                  width={Dimensions.get('window').width - 48}
                  height={200}
                  zoom={14}
                />
              )}
              <View style={[styles.selectedLocationBadge, { backgroundColor: colors.card }]}>
                <MapPin size={16} color={Colors.primary} />
                <Text style={[styles.selectedLocationText, { color: colors.text }]} numberOfLines={2}>
                  {selectedLocation.name}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.confirmLocationButton}
                onPress={handleConfirmLocation}
              >
                <Text style={styles.confirmLocationButtonText}>Confirm this location</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
            <Search size={20} color={colors.muted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search for a location..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.mapButton}
            onPress={handleUseCurrentLocation}
            disabled={isLoadingLocation}
          >
            <View style={styles.mapButtonContent}>
              <View style={styles.mapIconContainer}>
                <Locate size={24} color={Colors.primary} />
              </View>
              <View style={styles.mapButtonText}>
                <Text style={[styles.mapButtonTitle, { color: colors.text }]}>
                  Use current location
                </Text>
                <Text style={[styles.mapButtonSubtitle, { color: colors.muted }]}>
                  Automatically detect your location
                </Text>
              </View>
            </View>
            {isLoadingLocation && (
              <ActivityIndicator size="small" color={Colors.primary} />
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.muted }]}>
              Or select a location
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <ScrollView
            style={styles.locationList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredLocations.map((location, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.locationItem,
                  { backgroundColor: colors.background },
                  selectedLocation?.name === location.name && styles.locationItemSelected,
                ]}
                onPress={() => handleSelectLocationFromList(location)}
              >
                <View style={styles.locationIconContainer}>
                  <MapPin size={20} color={selectedLocation?.name === location.name ? Colors.primary : colors.muted} />
                </View>
                <Text style={[styles.locationText, { color: colors.text }]}>
                  {location.name}
                </Text>
              </TouchableOpacity>
            ))}
            {filteredLocations.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.muted }]}>
                  No locations found
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    maxHeight: '80%',
    ...Shadows.floating,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.headline,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.body,
    paddingVertical: Spacing.xs,
  },
  mapButton: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary + '15',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  mapButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapButtonText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  mapButtonTitle: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    marginBottom: 2,
  },
  mapButtonSubtitle: {
    ...Typography.caption,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...Typography.caption,
    marginHorizontal: Spacing.md,
  },
  locationList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.body,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...Typography.body,
  },
  mapPreviewContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  selectedLocationBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  selectedLocationText: {
    flex: 1,
    marginLeft: Spacing.xs,
    ...Typography.caption,
    fontWeight: '600',
  },
  confirmLocationButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  confirmLocationButtonText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  locationItemSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});

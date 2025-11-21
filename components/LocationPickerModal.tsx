import React, { useState, useEffect } from "react";
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
} from "react-native";
import * as Location from "expo-location";
import { X, MapPin, Search, Locate, Navigation } from "lucide-react-native";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "@/constants/theme";
import { useThemedColors } from "@/hooks/useThemedColors";
import StaticMapView from "./StaticMapView";
import InteractiveMapView from "./InteractiveMapView";

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (
    location: string,
    latitude?: number,
    longitude?: number
  ) => void;
  currentLocation?: string;
}

interface LocationSuggestion {
  name: string;
  description: string;
  place_id: string;
  types?: string[];
}

export default function LocationPickerModal({
  visible,
  onClose,
  onSelectLocation,
}: LocationPickerModalProps) {
  const colors = useThemedColors();

  const [searchQuery, setSearchQuery] = useState("");
  const [googleSuggestions, setGoogleSuggestions] = useState<LocationSuggestion[]>([]);
  const [nearbySuggestions, setNearbySuggestions] = useState<LocationSuggestion[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);

  const [userCurrentLocation, setUserCurrentLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);

  // Get user's current location when modal opens
  useEffect(() => {
    if (visible) {
      handleGetCurrentLocation(true);
    }
  }, [visible]);

  // Fetch nearby places when user location is available
  useEffect(() => {
    if (userCurrentLocation) {
      fetchNearbyPlaces(userCurrentLocation.lat, userCurrentLocation.lng);
    }
  }, [userCurrentLocation]);

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setGoogleSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setIsFetching(true);

        // Add location biasing if user location is available
        let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          searchQuery
        )}&components=country:zw&key=AIzaSyCyHL9gfX6NVPfX1oKTW0bT3AckztO8278`;

        // Bias results towards user's current location if available
        if (userCurrentLocation) {
          url += `&location=${userCurrentLocation.lat},${userCurrentLocation.lng}&radius=50000`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
          setGoogleSuggestions(data.predictions);
        } else {
          console.log("Google autocomplete failed:", data);
        }
      } catch (e) {
        console.log("Autocomplete fetch error:", e);
      } finally {
        setIsFetching(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, userCurrentLocation]);

  // Fetch nearby places
  const fetchNearbyPlaces = async (lat: number, lng: number) => {
    try {
      setIsLoadingNearby(true);
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=15000&key=AIzaSyCyHL9gfX6NVPfX1oKTW0bT3AckztO8278`
      );

      const data = await response.json();

      if (data.status === "OK") {
        setNearbySuggestions(
          data.results.slice(0, 10).map((place: any) => ({
            name: place.name,
            description: place.vicinity,
            place_id: place.place_id,
            types: place.types,
          }))
        );
      } else {
        console.log("Nearby places fetch failed:", data);
      }
    } catch (error) {
      console.log("Nearby places error:", error);
    } finally {
      setIsLoadingNearby(false);
    }
  };

  // Get current location
  const handleGetCurrentLocation = async (isAuto = false) => {
    if (!isAuto) {
      setIsLoadingLocation(true);
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        if (!isAuto) {
          Alert.alert(
            "Location Permission Required",
            "Please enable location access to use your current location.",
            [{ text: "OK" }]
          );
        }
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      let formattedAddress = "Current Location";

      // Reverse geocode to get address name
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addresses?.length > 0) {
          const address = addresses[0];
          const parts = [];
          if (address.street) parts.push(address.street);
          if (address.city) parts.push(address.city);
          if (address.region) parts.push(address.region);
          if (address.country) parts.push(address.country);

          formattedAddress =
            parts.filter(Boolean).join(", ") || "Current Location";
        }
      } catch (err) {
        console.log("Reverse geocoding failed:", err);

        // Web fallback using Google API
        if (Platform.OS === "web") {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCyHL9gfX6NVPfX1oKTW0bT3AckztO8278`
            );
            const data = await response.json();
            if (data.results?.length > 0) {
              formattedAddress = data.results[0].formatted_address;
            }
          } catch (geoErr) {
            console.log("Google geocode failed:", geoErr);
          }
        }
      }

      const userLocation = {
        name: formattedAddress,
        lat: latitude,
        lng: longitude,
      };

      setUserCurrentLocation(userLocation);
      
      // Only set as selected location if manually triggered
      if (!isAuto) {
        setSelectedLocation(userLocation);
      }

    } catch (error) {
      console.error("Error getting location:", error);
      if (!isAuto) {
        Alert.alert(
          "Error",
          "Unable to get your current location. Please try again."
        );
      }
    } finally {
      if (!isAuto) {
        setIsLoadingLocation(false);
      }
    }
  };

  const handleSelectSuggestion = async (suggestion: LocationSuggestion) => {
    try {
      const details = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&key=AIzaSyCyHL9gfX6NVPfX1oKTW0bT3AckztO8278`
      );
      const detailsData = await details.json();
      const loc = detailsData.result.geometry.location;

      setSelectedLocation({
        name: suggestion.description || suggestion.name,
        lat: loc.lat,
        lng: loc.lng,
      });
      
      setSearchQuery(suggestion.description || suggestion.name);
      setGoogleSuggestions([]);
    } catch (error) {
      console.log("Place details error:", error);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onSelectLocation(
        selectedLocation.name,
        selectedLocation.lat,
        selectedLocation.lng
      );
      onClose();
      setSelectedLocation(null);
      setSearchQuery("");
    }
  };

  const handleClose = () => {
    setSelectedLocation(null);
    setSearchQuery("");
    setGoogleSuggestions([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Choose Location
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Current Location Display */}
          {userCurrentLocation && (
            <View style={styles.currentLocationContainer}>
              <View style={styles.currentLocationHeader}>
                <Navigation size={16} color={Colors.primary} />
                <Text style={[styles.currentLocationTitle, { color: colors.text }]}>
                  Your Current Location
                </Text>
              </View>
              <Text style={[styles.currentLocationText, { color: colors.muted }]}>
                {userCurrentLocation.name}
              </Text>
            </View>
          )}

          {/* Map Preview */}
          {selectedLocation && (
            <View style={styles.mapPreviewContainer}>
              {Platform.OS === "web" ? (
                <InteractiveMapView
                  latitude={selectedLocation.lat}
                  longitude={selectedLocation.lng}
                  width={Dimensions.get("window").width - 48}
                  height={250}
                  zoom={14}
                />
              ) : (
                <StaticMapView
                  latitude={selectedLocation.lat}
                  longitude={selectedLocation.lng}
                  width={Dimensions.get("window").width - 48}
                  height={200}
                  zoom={14}
                />
              )}

              <View
                style={[
                  styles.selectedLocationBadge,
                  { backgroundColor: colors.card },
                ]}
              >
                <MapPin size={16} color={Colors.primary} />
                <Text
                  style={[
                    styles.selectedLocationText,
                    { color: colors.text },
                  ]}
                  numberOfLines={2}
                >
                  {selectedLocation.name}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.confirmLocationButton}
                onPress={handleConfirmLocation}
              >
                <Text style={styles.confirmLocationButtonText}>
                  Confirm this location
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Search with Autocomplete */}
          <View style={styles.searchSection}>
            <View
              style={[
                styles.searchContainer,
                { backgroundColor: colors.background },
              ]}
            >
              <Search size={20} color={colors.muted} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search for a location..."
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {isFetching && (
                <ActivityIndicator size="small" color={Colors.primary} />
              )}
            </View>

            {/* Autocomplete Dropdown */}
            {googleSuggestions.length > 0 && (
              <View style={[styles.autocompleteContainer, { backgroundColor: colors.background }]}>
                <ScrollView 
                  style={styles.autocompleteList}
                  keyboardShouldPersistTaps="handled"
                >
                  {googleSuggestions.map((item, index) => (
                    <TouchableOpacity
                      key={item.place_id}
                      style={[
                        styles.autocompleteItem,
                        { borderBottomColor: colors.border },
                      ]}
                      onPress={() => handleSelectSuggestion(item)}
                    >
                      <MapPin size={16} color={colors.muted} />
                      <Text
                        style={[styles.autocompleteText, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Current Location Button */}
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => handleGetCurrentLocation(false)}
            disabled={isLoadingLocation}
          >
            <View style={styles.mapButtonContent}>
              <View style={styles.mapIconContainer}>
                <Locate size={24} color={Colors.primary} />
              </View>

              <View style={styles.mapButtonText}>
                <Text
                  style={[styles.mapButtonTitle, { color: colors.text }]}
                >
                  Use current location
                </Text>
                <Text
                  style={[styles.mapButtonSubtitle, { color: colors.muted }]}
                >
                  Automatically detect your location
                </Text>
              </View>
            </View>

            {isLoadingLocation && (
              <ActivityIndicator size="small" color={Colors.primary} />
            )}
          </TouchableOpacity>

          {/* Nearby Locations */}
          {nearbySuggestions.length > 0 && (
            <>
              <View style={styles.divider}>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: colors.border },
                  ]}
                />
                <Text
                  style={[styles.dividerText, { color: colors.text }]}
                >
                  Nearby Locations
                </Text>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: colors.border },
                  ]}
                />
              </View>

              <ScrollView
                style={styles.locationList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {nearbySuggestions.map((item) => (
                  <TouchableOpacity
                    key={item.place_id}
                    style={[
                      styles.locationItem,
                      { backgroundColor: colors.background },
                    ]}
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    <View style={styles.locationIconContainer}>
                      <MapPin size={20} color={colors.muted} />
                    </View>

                    <View style={styles.locationTextContainer}>
                      <Text
                        style={[styles.locationText, { color: colors.text }]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.locationDescription, { color: colors.muted }]}
                      >
                        {item.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {isLoadingNearby && (
                  <ActivityIndicator size="small" color={Colors.primary} style={styles.loadingIndicator} />
                )}
              </ScrollView>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    maxHeight: "90%",
    ...Shadows.floating,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.headline,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  currentLocationContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary + "10",
    borderWidth: 1,
    borderColor: Colors.primary + "20",
  },
  currentLocationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  currentLocationTitle: {
    ...Typography.caption,
    fontWeight: "600",
    marginLeft: Spacing.xs,
  },
  currentLocationText: {
    ...Typography.body,
    fontSize: 14,
  },
  searchSection: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.body,
    paddingVertical: Spacing.xs,
  },
  autocompleteContainer: {
    position: 'absolute',
    top: '100%',
    left: Spacing.lg,
    right: Spacing.lg,
    maxHeight: 200,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
    ...Shadows.card,
    zIndex: 1001,
  },
  autocompleteList: {
    maxHeight: 200,
  },
  autocompleteItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  autocompleteText: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.body,
  },
  mapButton: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary + "15",
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  mapButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  mapButtonText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  mapButtonTitle: {
    ...Typography.bodyMedium,
    fontWeight: "600",
    marginBottom: 2,
  },
  mapButtonSubtitle: {
    ...Typography.caption,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
  },
  locationList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    maxHeight: 200,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  locationText: {
    ...Typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  locationDescription: {
    ...Typography.caption,
    fontSize: 12,
  },
  loadingIndicator: {
    marginVertical: Spacing.lg,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyStateText: {
    ...Typography.body,
  },
  mapPreviewContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  selectedLocationBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  selectedLocationText: {
    flex: 1,
    marginLeft: Spacing.xs,
    ...Typography.caption,
    fontWeight: "600",
  },
  confirmLocationButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  confirmLocationButtonText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    fontWeight: "600",
  },
});
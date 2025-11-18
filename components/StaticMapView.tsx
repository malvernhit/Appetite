import React, { useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Text } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Colors, BorderRadius, Shadows, Typography } from '@/constants/theme';

interface StaticMapViewProps {
  latitude: number;
  longitude: number;
  width?: number;
  height?: number;
  zoom?: number;
}

export default function StaticMapView({
  latitude,
  longitude,
  width = 400,
  height = 300,
  zoom = 15,
}: StaticMapViewProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${Math.round(width)}x${height}&markers=color:red%7C${latitude},${longitude}&maptype=roadmap&key=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao`;

  return (
    <View style={[styles.container, { height }]}>
      {imageLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
      {imageError ? (
        <View style={styles.errorContainer}>
          <MapPin size={32} color={Colors.muted} />
          <Text style={styles.errorText}>
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: mapImageUrl }}
          style={styles.mapImage}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.neutral,
    ...Shadows.card,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.muted,
    marginTop: 8,
  },
});

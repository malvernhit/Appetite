import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors, BorderRadius, Shadows } from '@/constants/theme';

interface InteractiveMapViewProps {
  latitude: number;
  longitude: number;
  width?: number;
  height?: number;
  zoom?: number;
}

export default function InteractiveMapView({
  latitude,
  longitude,
  width = 400,
  height = 300,
  zoom = 14,
}: InteractiveMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const initMap = () => {
      if (!mapContainerRef.current) return;

      const googleMapScript = document.querySelector('script[src*="maps.googleapis.com"]');

      if (!googleMapScript) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCyHL9gfX6NVPfX1oKTW0bT3AckztO8278`;
        script.async = true;
        script.defer = true;
        script.onload = createMap;
        document.head.appendChild(script);
      } else if ((window as any).google?.maps) {
        createMap();
      }
    };

    const createMap = () => {
      if (!mapContainerRef.current || !((window as any).google?.maps)) return;

      const mapOptions = {
        center: { lat: latitude, lng: longitude },
        zoom: zoom,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      };

      mapRef.current = new (window as any).google.maps.Map(
        mapContainerRef.current,
        mapOptions
      );

      new (window as any).google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapRef.current,
        title: 'Your Location',
      });
    };

    initMap();
  }, [latitude, longitude, zoom]);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={[styles.container, { height }]}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.neutral,
    ...Shadows.card,
  },
});

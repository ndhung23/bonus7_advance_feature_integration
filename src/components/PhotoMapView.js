import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { COLORS, RADIUS, SPACING } from '../styles/theme';
import { openInGoogleMaps } from '../services/locationService';

export default function PhotoMapView({
  latitude,
  longitude,
  title,
  description,
  style,
  showOpenButton = true,
}) {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Text style={styles.fallbackIcon}>📍</Text>
        <Text style={styles.fallbackTitle}>Không có dữ liệu toạ độ GPS</Text>
        <Text style={styles.fallbackSubtitle}>
          Bức ảnh này không chứa thông tin vị trí khi chụp hoặc chọn.
        </Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: Number(latitude),
    longitude: Number(longitude),
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        <Marker
          coordinate={{
            latitude: Number(latitude),
            longitude: Number(longitude),
          }}
          title={title || 'Vị trí chụp'}
          description={description || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
        />
      </MapView>

      {showOpenButton && (
        <TouchableOpacity
          style={styles.openMapsButton}
          onPress={() => openInGoogleMaps(latitude, longitude, title)}
          activeOpacity={0.8}
        >
          <Text style={styles.openMapsText}>🗺️ Mở Google Maps ứng dụng</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  openMapsButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  openMapsText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 160,
  },
  fallbackIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  fallbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  fallbackSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

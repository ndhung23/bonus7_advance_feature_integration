import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import { formatDate, truncate } from '../utils/formatters';
import { openInGoogleMaps } from '../services/locationService';

export default function MapOverviewScreen({ photos, onPhotoPress }) {
  const mapRef = useRef(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const localizedPhotos = photos.filter(
    (p) =>
      p.location &&
      p.location.latitude !== null &&
      p.location.latitude !== undefined &&
      p.location.longitude !== null &&
      p.location.longitude !== undefined
  );

  if (localizedPhotos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🗺️</Text>
        <Text style={styles.emptyTitle}>Chưa có ảnh nào có toạ độ GPS</Text>
        <Text style={styles.emptySubtitle}>
          Khi bạn chụp ảnh và cho phép quyền truy cập vị trí, các bức ảnh sẽ được đánh dấu trực tiếp trên bản đồ tại đây!
        </Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: localizedPhotos[0].location.latitude,
    longitude: localizedPhotos[0].location.longitude,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  const handleCenterAll = () => {
    if (mapRef.current && localizedPhotos.length > 0) {
      const coordinates = localizedPhotos.map((p) => ({
        latitude: p.location.latitude,
        longitude: p.location.longitude,
      }));
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {localizedPhotos.map((photo) => (
          <Marker
            key={photo.id}
            coordinate={{
              latitude: photo.location.latitude,
              longitude: photo.location.longitude,
            }}
            title={formatDate(photo.timestamp)}
            description={truncate(photo.description || photo.location.address, 40)}
            onPress={() => setSelectedPhoto(photo)}
          />
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.fitAllButton}
        onPress={handleCenterAll}
        activeOpacity={0.8}
      >
        <Text style={styles.fitAllButtonText}>🎯 Xem tất cả ảnh ({localizedPhotos.length})</Text>
      </TouchableOpacity>

      {selectedPhoto && (
        <View style={styles.previewCard}>
          <Image source={{ uri: selectedPhoto.uri }} style={styles.previewImage} />
          <View style={styles.previewInfo}>
            <Text style={styles.previewDate}>
              {formatDate(selectedPhoto.timestamp)}
            </Text>
            <Text style={styles.previewAddress} numberOfLines={1}>
              📍 {selectedPhoto.location?.address || 'Toạ độ GPS'}
            </Text>
            <Text style={styles.previewDesc} numberOfLines={2}>
              {selectedPhoto.description || 'Chưa có miêu tả AI.'}
            </Text>

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.actionMapBtn}
                onPress={() =>
                  openInGoogleMaps(
                    selectedPhoto.location.latitude,
                    selectedPhoto.location.longitude,
                    selectedPhoto.description
                  )
                }
              >
                <Text style={styles.actionMapText}>Google Maps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionDetailBtn}
                onPress={() => onPhotoPress(selectedPhoto)}
              >
                <Text style={styles.actionDetailText}>Chi tiết ➜</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closePreviewBtn}
            onPress={() => setSelectedPhoto(null)}
          >
            <Text style={styles.closePreviewText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  fitAllButton: {
    position: 'absolute',
    top: SPACING.md,
    alignSelf: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  fitAllButtonText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  previewCard: {
    position: 'absolute',
    bottom: 90,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: '#E2E8F0',
  },
  previewInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
    marginRight: SPACING.md,
  },
  previewDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  previewAddress: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  previewDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  previewActions: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  actionMapBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  actionMapText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  actionDetailBtn: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  actionDetailText: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '600',
  },
  closePreviewBtn: {
    position: 'absolute',
    top: 6,
    right: 8,
    padding: 4,
  },
  closePreviewText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
});


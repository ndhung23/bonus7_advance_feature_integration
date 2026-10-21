import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import { formatDate, truncate } from '../utils/formatters';
import { openInGoogleMaps } from '../services/locationService';

export default function MapOverviewScreen({ photos, onPhotoPress }) {
  const localizedPhotos = photos.filter(
    (p) =>
      p.location &&
      p.location.latitude !== null &&
      p.location.latitude !== undefined &&
      p.location.longitude !== null &&
      p.location.longitude !== undefined
  );

  const [selectedPhoto, setSelectedPhoto] = useState(
    localizedPhotos.length > 0 ? localizedPhotos[0] : null
  );

  if (localizedPhotos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🗺️</Text>
        <Text style={styles.emptyTitle}>Chưa có ảnh nào có toạ độ GPS</Text>
        <Text style={styles.emptySubtitle}>
          Khi bạn chụp hoặc chọn ảnh và cấp quyền vị trí, các bức ảnh sẽ được hiển thị trên bản đồ Google Maps tại đây!
        </Text>
      </View>
    );
  }

  const activeLat = selectedPhoto?.location?.latitude ?? localizedPhotos[0].location.latitude;
  const activeLng = selectedPhoto?.location?.longitude ?? localizedPhotos[0].location.longitude;
  const mapUrl = `https://maps.google.com/maps?q=${activeLat},${activeLng}&z=15&output=embed`;

  return (
    <View style={styles.container}>
      {/* Google Map Web Iframe */}
      <View style={styles.mapWrapper}>
        <iframe
          src={mapUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Google Map Overview"
          loading="lazy"
        />

        <TouchableOpacity
          style={styles.openExternalBtn}
          onPress={() =>
            openInGoogleMaps(
              activeLat,
              activeLng,
              selectedPhoto?.description || 'Vị trí chụp ảnh'
            )
          }
          activeOpacity={0.8}
        >
          <Text style={styles.openExternalText}>🗺️ Mở Google Maps ngoài</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách ảnh đã ghim trên bản đồ */}
      <View style={styles.listContainer}>
        <Text style={styles.listHeader}>
          📍 Các bức ảnh trên bản đồ ({localizedPhotos.length})
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {localizedPhotos.map((photo) => {
            const isSelected = selectedPhoto?.id === photo.id;
            return (
              <TouchableOpacity
                key={photo.id}
                style={[styles.miniCard, isSelected && styles.miniCardActive]}
                onPress={() => setSelectedPhoto(photo)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: photo.uri }} style={styles.miniThumb} />
                <View style={styles.miniInfo}>
                  <Text style={styles.miniDate}>{formatDate(photo.timestamp)}</Text>
                  <Text style={styles.miniAddress} numberOfLines={1}>
                    📍 {photo.location?.address}
                  </Text>
                  <TouchableOpacity
                    style={styles.detailBtn}
                    onPress={() => onPhotoPress(photo)}
                  >
                    <Text style={styles.detailBtnText}>Chi tiết ➜</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
    minHeight: 300,
  },
  openExternalBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
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
    elevation: 4,
  },
  openExternalText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.sm,
  },
  listHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  horizontalScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  miniCard: {
    flexDirection: 'row',
    width: 260,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  miniCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  miniThumb: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.sm,
    backgroundColor: '#E2E8F0',
  },
  miniInfo: {
    flex: 1,
    marginLeft: 10,
  },
  miniDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  miniAddress: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  detailBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  detailBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
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
});

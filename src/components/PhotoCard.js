import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import { formatDate, formatCoordinates, truncate } from '../utils/formatters';
import { openInGoogleMaps } from '../services/locationService';

export default function PhotoCard({ photo, onPress, onDelete }) {
  const handleDelete = () => {
    Alert.alert(
      'Xoá ảnh',
      'Bạn có chắc chắn muốn xoá bức ảnh này không? Dữ liệu và vị trí liên quan sẽ bị xoá vĩnh viễn khỏi AsyncStorage.',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá ngay',
          style: 'destructive',
          onPress: () => onDelete(photo.id),
        },
      ]
    );
  };

  const handleOpenMap = () => {
    if (photo.location?.latitude && photo.location?.longitude) {
      openInGoogleMaps(
        photo.location.latitude,
        photo.location.longitude,
        photo.description || 'Vị trí chụp ảnh'
      );
    } else {
      Alert.alert('Thông báo', 'Ảnh này không có thông tin toạ độ GPS.');
    }
  };

  const hasLocation =
    photo.location &&
    photo.location.latitude !== null &&
    photo.location.latitude !== undefined &&
    photo.location.longitude !== null &&
    photo.location.longitude !== undefined;

  const isAiLoading = photo.status === 'loading';
  const isAiError = photo.status === 'error';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(photo)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: photo.uri }} style={styles.thumbnail} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.timeText}>{formatDate(photo.timestamp)}</Text>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteIconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.deleteIconText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.locationContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {photo.location?.address ||
              formatCoordinates(photo.location?.latitude, photo.location?.longitude)}
          </Text>
        </View>

        <View style={styles.aiBadgeContainer}>
          <View style={[styles.aiBadge, isAiLoading && styles.aiBadgeLoading]}>
            <Text style={styles.aiBadgeText}>
              {isAiLoading ? '⏳ Gemini AI đang viết...' : '✨ Gemini AI'}
            </Text>
          </View>
        </View>

        {isAiLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.accent} />
            <Text style={styles.loadingAiText}>Đang nhận diện nội dung bức ảnh...</Text>
          </View>
        ) : isAiError ? (
          <Text style={styles.errorText} numberOfLines={2}>
            ⚠️ {photo.error || 'Chưa tạo được mô tả. Bấm vào chi tiết để tạo lại.'}
          </Text>
        ) : (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {photo.description || 'Chưa có miêu tả từ AI.'}
          </Text>
        )}

        <View style={styles.footerRow}>
          {hasLocation ? (
            <TouchableOpacity
              style={styles.mapButton}
              onPress={handleOpenMap}
              activeOpacity={0.7}
            >
              <Text style={styles.mapButtonText}>🗺️ Mở Google Maps</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.noLocationBadge}>
              <Text style={styles.noLocationText}>Không có GPS</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => onPress(photo)}
            activeOpacity={0.7}
          >
            <Text style={styles.detailButtonText}>Chi tiết ➜</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#E2E8F0',
  },
  content: {
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  deleteIconButton: {
    padding: 4,
  },
  deleteIconText: {
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
    flex: 1,
  },
  aiBadgeContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  aiBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  aiBadgeLoading: {
    backgroundColor: '#FEF3C7',
  },
  aiBadgeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
    paddingVertical: 4,
  },
  loadingAiText: {
    fontSize: 12,
    color: COLORS.accent,
    marginLeft: 6,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginVertical: SPACING.xs,
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    marginVertical: SPACING.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  mapButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  mapButtonText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  noLocationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  noLocationText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  detailButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  detailButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});

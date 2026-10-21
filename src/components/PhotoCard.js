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
import { formatDate, formatCoordinates } from '../utils/formatters';
import { openInGoogleMaps } from '../services/locationService';

export default function PhotoCard({
  photo,
  onPress,
  onDelete,
  onGenerateDescription,
}) {
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
  const hasDescription = Boolean(photo.description && photo.description.trim().length > 0);

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

        {/* AI Description Section */}
        {isAiLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.accent} />
            <Text style={styles.loadingAiText}>Gemini AI đang phân tích...</Text>
          </View>
        ) : isAiError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText} numberOfLines={2}>
              ⚠️ {photo.error || 'Chưa tạo được mô tả.'}
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => onGenerateDescription(photo.id)}
            >
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : hasDescription ? (
          <View style={styles.descContainer}>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>✨ Gemini AI</Text>
            </View>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {photo.description}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.requestAiBtn}
            onPress={() => onGenerateDescription(photo.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.requestAiText}>✨ Bấm để Gemini AI tạo mô tả</Text>
          </TouchableOpacity>
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
  descContainer: {
    marginTop: 4,
  },
  aiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
  aiBadgeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  requestAiBtn: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  requestAiText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
    paddingVertical: 6,
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
  },
  loadingAiText: {
    fontSize: 12,
    color: COLORS.accent,
    marginLeft: 8,
    fontWeight: '600',
  },
  errorBox: {
    marginVertical: SPACING.xs,
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: RADIUS.md,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    lineHeight: 16,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.sm,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
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

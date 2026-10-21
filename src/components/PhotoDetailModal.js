import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import { formatDate, formatCoordinates } from '../utils/formatters';
import PhotoMapView from './PhotoMapView';

export default function PhotoDetailModal({
  visible,
  photo,
  onClose,
  onDelete,
  onGenerateDescription,
}) {
  if (!photo) return null;

  const confirmDelete = () => {
    Alert.alert(
      'Xoá ảnh',
      'Bạn có chắc chắn muốn xoá ảnh này vĩnh viễn khỏi ứng dụng?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá ngay',
          style: 'destructive',
          onPress: () => {
            onClose();
            onDelete(photo.id);
          },
        },
      ]
    );
  };

  const isAiLoading = photo.status === 'loading';
  const isAiError = photo.status === 'error';
  const hasDescription = Boolean(photo.description && photo.description.trim().length > 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeButtonText}>✕ Đóng</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Chi tiết ảnh</Text>
          <TouchableOpacity
            style={styles.deleteTopButton}
            onPress={confirmDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteTopText}>🗑️ Xoá</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: photo.uri }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* AI Description Section */}
          <View style={styles.cardSection}>
            <Text style={styles.timestampText}>{formatDate(photo.timestamp)}</Text>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>✨ Miêu tả bởi Gemini AI</Text>
              {hasDescription && (
                <TouchableOpacity
                  style={styles.regenerateButton}
                  onPress={() => onGenerateDescription(photo.id)}
                  disabled={isAiLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.regenerateButtonText}>🔄 Tạo lại</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.descriptionBox}>
              {isAiLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={COLORS.accent} />
                  <Text style={styles.loadingDescriptionText}>
                    Gemini AI đang phân tích và tạo mô tả...
                  </Text>
                </View>
              ) : isAiError ? (
                <View>
                  <Text style={styles.errorText}>
                    ⚠️ {photo.error || 'Chưa tạo được mô tả.'}
                  </Text>
                  <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={() => onGenerateDescription(photo.id)}
                  >
                    <Text style={styles.retryBtnText}>Thử lại ngay</Text>
                  </TouchableOpacity>
                </View>
              ) : hasDescription ? (
                <Text style={styles.descriptionText}>{photo.description}</Text>
              ) : (
                <View style={styles.noDescriptionContainer}>
                  <Text style={styles.noDescriptionText}>
                    Bức ảnh này chưa được tạo mô tả bằng Gemini AI.
                  </Text>
                  <TouchableOpacity
                    style={styles.generateCtaBtn}
                    onPress={() => onGenerateDescription(photo.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.generateCtaBtnText}>
                      ✨ Phân tích & Tạo mô tả bằng Gemini AI
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Location & Google Map Section */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>📍 Vị trí trên Google Map</Text>
            <Text style={styles.addressText}>
              {photo.location?.address || 'Không rõ địa chỉ'}
            </Text>
            <Text style={styles.coordinatesText}>
              Toạ độ: {formatCoordinates(photo.location?.latitude, photo.location?.longitude)}
            </Text>

            <PhotoMapView
              latitude={photo.location?.latitude}
              longitude={photo.location?.longitude}
              title="Vị trí chụp ảnh"
              description={photo.location?.address}
              style={styles.mapContainer}
              showOpenButton={true}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeButtonText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  deleteTopButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteTopText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },
  image: {
    width: '100%',
    height: 320,
    backgroundColor: '#000',
  },
  cardSection: {
    backgroundColor: COLORS.card,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timestampText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  regenerateButton: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  regenerateButtonText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  descriptionBox: {
    backgroundColor: '#FAF5FF',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  loadingDescriptionText: {
    fontSize: 14,
    color: COLORS.accent,
    marginLeft: 8,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    color: COLORS.danger,
    lineHeight: 18,
    marginBottom: 8,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  noDescriptionContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  noDescriptionText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 10,
    textAlign: 'center',
  },
  generateCtaBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generateCtaBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginTop: SPACING.xs,
  },
  coordinatesText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  mapContainer: {
    height: 240,
    marginTop: SPACING.xs,
  },
});

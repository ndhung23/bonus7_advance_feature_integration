import React, { useState } from 'react';
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
import { generateImageDescription } from '../services/geminiService';
import { updatePhoto } from '../services/storageService';

export default function PhotoDetailModal({
  visible,
  photo,
  onClose,
  onDelete,
  onPhotoUpdated,
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!photo) return null;

  const handleRegenerateDescription = async () => {
    if (!photo.base64) {
      Alert.alert(
        'Thông báo',
        'Ảnh này không có dữ liệu base64 để gửi tới Gemini AI.'
      );
      return;
    }

    try {
      setIsGenerating(true);
      const newDescription = await generateImageDescription(photo.base64);
      const updatedPhotos = await updatePhoto(photo.id, {
        description: newDescription,
      });
      if (onPhotoUpdated) {
        onPhotoUpdated(updatedPhotos, { ...photo, description: newDescription });
      }
      Alert.alert('Thành công', 'Đã cập nhật miêu tả từ Gemini AI!');
    } catch (error) {
      Alert.alert('Lỗi Gemini AI', error.message || 'Không thể tạo miêu tả mới.');
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Xoá ảnh',
      'Bạn có chắc chắn muốn xoá ảnh này vĩnh viễn?',
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

          <View style={styles.cardSection}>
            <Text style={styles.timestampText}>{formatDate(photo.timestamp)}</Text>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>✨ Miêu tả bởi Gemini AI</Text>
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={handleRegenerateDescription}
                disabled={isGenerating}
                activeOpacity={0.7}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color={COLORS.accent} />
                ) : (
                  <Text style={styles.regenerateButtonText}>🔄 Tạo lại</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>
                {photo.description || 'Chưa có miêu tả nào từ AI.'}
              </Text>
            </View>
          </View>

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
  descriptionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
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
    height: 220,
    marginTop: SPACING.xs,
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from './src/styles/theme';
import Header from './src/components/Header';
import GalleryScreen from './src/screens/GalleryScreen';
import MapOverviewScreen from './src/screens/MapOverviewScreen';
import PhotoDetailModal from './src/components/PhotoDetailModal';
import ApiKeyModal from './src/components/ApiKeyModal';
import {
  getStoredPhotos,
  addPhoto,
  deletePhoto,
  updatePhoto,
} from './src/services/storageService';
import { getCurrentLocation } from './src/services/locationService';
import { takePhoto, pickPhoto } from './src/services/imagePickerService';
import { generateImageDescription } from './src/services/geminiService';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState('gallery');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isApiKeyModalVisible, setIsApiKeyModalVisible] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const data = await getStoredPhotos();
      setPhotos(data);
    } catch (error) {
      console.error('Không thể tải danh sách ảnh:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  }, []);

  const handleProcessImage = async (imageResult) => {
    if (!imageResult) return;

    const photoId = Date.now().toString();

    // Lấy toạ độ GPS (nhanh)
    const location = await getCurrentLocation();

    // Thêm ảnh ngay lập tức vào danh sách với status loading để UX mượt mà
    const newPhoto = {
      id: photoId,
      uri: imageResult.uri,
      base64: imageResult.base64,
      timestamp: new Date().toISOString(),
      location,
      description: '',
      status: 'loading',
      error: null,
    };

    const updatedList = await addPhoto(newPhoto);
    setPhotos(updatedList);

    // Bắt đầu gọi Gemini AI trong nền
    try {
      const aiDescription = await generateImageDescription(imageResult.base64);
      const finalList = await updatePhoto(photoId, {
        description: aiDescription,
        status: 'done',
        error: null,
      });
      setPhotos(finalList);

      setSelectedPhoto((prev) =>
        prev?.id === photoId
          ? { ...prev, description: aiDescription, status: 'done', error: null }
          : prev
      );
    } catch (aiError) {
      console.warn('Lỗi phân tích Gemini:', aiError);
      const finalList = await updatePhoto(photoId, {
        status: 'error',
        error: aiError.message || 'Không thể tạo mô tả AI.',
      });
      setPhotos(finalList);

      setSelectedPhoto((prev) =>
        prev?.id === photoId
          ? {
              ...prev,
              status: 'error',
              error: aiError.message || 'Không thể tạo mô tả AI.',
            }
          : prev
      );
    }
  };

  const handleTakePhoto = async () => {
    setIsCapturing(true);
    try {
      const result = await takePhoto();
      if (result) {
        await handleProcessImage(result);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickPhoto = async () => {
    setIsCapturing(true);
    try {
      const result = await pickPhoto();
      if (result) {
        await handleProcessImage(result);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const updatedList = await deletePhoto(photoId);
      setPhotos(updatedList);
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xoá ảnh khỏi bộ nhớ.');
    }
  };

  const handlePhotoUpdated = (updatedPhotos, updatedPhoto) => {
    setPhotos(updatedPhotos);
    setSelectedPhoto(updatedPhoto);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        photoCount={photos.length}
        onOpenApiKeyModal={() => setIsApiKeyModalVisible(true)}
      />

      <View style={styles.content}>
        {activeTab === 'gallery' ? (
          <GalleryScreen
            photos={photos}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onPhotoPress={setSelectedPhoto}
            onPhotoDelete={handleDeletePhoto}
            onTakePhoto={handleTakePhoto}
            onPickPhoto={handlePickPhoto}
          />
        ) : (
          <MapOverviewScreen
            photos={photos}
            onPhotoPress={setSelectedPhoto}
          />
        )}
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.fabSecondary]}
          onPress={handlePickPhoto}
          disabled={isCapturing}
          activeOpacity={0.8}
        >
          <Text style={styles.fabSecondaryText}>🖼️ Thư viện</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.fabPrimary]}
          onPress={handleTakePhoto}
          disabled={isCapturing}
          activeOpacity={0.8}
        >
          {isCapturing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.fabPrimaryText}>📸 Chụp ảnh</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Photo Detail Modal */}
      <PhotoDetailModal
        visible={!!selectedPhoto}
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onDelete={handleDeletePhoto}
        onPhotoUpdated={handlePhotoUpdated}
      />

      {/* Gemini API Key Configuration Modal */}
      <ApiKeyModal
        visible={isApiKeyModalVisible}
        onClose={() => setIsApiKeyModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  fab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  fabPrimary: {
    backgroundColor: COLORS.primary,
  },
  fabPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  fabSecondary: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fabSecondaryText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 13,
  },
});

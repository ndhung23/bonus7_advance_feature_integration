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
  Modal,
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
} from './src/services/storageService';
import { getCurrentLocation } from './src/services/locationService';
import { takePhoto, pickPhoto } from './src/services/imagePickerService';
import { generateImageDescription } from './src/services/geminiService';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'map'
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isApiKeyModalVisible, setIsApiKeyModalVisible] = useState(false);

  // Processing state for taking photo + AI analysis
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // Load photos on mount
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

    setIsProcessing(true);
    try {
      // Step 1: Get GPS Location
      setProcessingStatus('Đang lấy vị trí GPS hiện tại...');
      const location = await getCurrentLocation();

      // Step 2: Call Gemini AI for description
      setProcessingStatus('Gemini AI đang phân tích nội dung bức ảnh...');
      let description = '';
      try {
        description = await generateImageDescription(imageResult.base64);
      } catch (aiError) {
        console.warn('Lỗi phân tích Gemini:', aiError);
        description = 'Chưa thể tạo mô tả AI (Kiểm tra lại Gemini API Key).';
        Alert.alert(
          'Gemini AI',
          aiError.message ||
            'Không thể tự động phân tích ảnh. Bạn có thể bấm vào ảnh để tạo lại sau khi cấu hình API Key.'
        );
      }

      // Step 3: Save to AsyncStorage
      setProcessingStatus('Đang lưu thông tin ảnh vào bộ nhớ máy...');
      const newPhotoItem = {
        id: Date.now().toString(),
        uri: imageResult.uri,
        base64: imageResult.base64,
        timestamp: new Date().toISOString(),
        location,
        description,
      };

      const updatedList = await addPhoto(newPhotoItem);
      setPhotos(updatedList);
    } catch (error) {
      console.error('Lỗi khi xử lý ảnh mới:', error);
      Alert.alert('Lỗi', 'Đã xảy ra sự cố khi lưu ảnh.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (result) {
      await handleProcessImage(result);
    }
  };

  const handlePickPhoto = async () => {
    const result = await pickPhoto();
    if (result) {
      await handleProcessImage(result);
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
          activeOpacity={0.8}
        >
          <Text style={styles.fabSecondaryText}>🖼️ Thư viện</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.fabPrimary]}
          onPress={handleTakePhoto}
          activeOpacity={0.8}
        >
          <Text style={styles.fabPrimaryText}>📸 Chụp ảnh</Text>
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

      {/* Loading Overlay when capturing + AI processing */}
      <Modal visible={isProcessing} transparent={true} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingTitle}>Đang xử lý bức ảnh</Text>
            <Text style={styles.loadingSubtitle}>{processingStatus}</Text>
          </View>
        </View>
      </Modal>
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
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  loadingCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '85%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
});

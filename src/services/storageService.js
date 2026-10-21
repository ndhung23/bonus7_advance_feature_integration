import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PHOTOS: '@snap_ai_photos',
  API_KEY: '@snap_ai_gemini_key',
};

export async function getStoredPhotos() {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.PHOTOS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Lỗi khi đọc danh sách ảnh từ AsyncStorage:', error);
    return [];
  }
}

export async function savePhotos(photos) {
  try {
    const jsonValue = JSON.stringify(photos);
    await AsyncStorage.setItem(STORAGE_KEYS.PHOTOS, jsonValue);
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu ảnh vào AsyncStorage:', error);
    return false;
  }
}

export async function addPhoto(photoItem) {
  try {
    const existingPhotos = await getStoredPhotos();
    const updated = [photoItem, ...existingPhotos];
    await savePhotos(updated);
    return updated;
  } catch (error) {
    console.error('Lỗi khi thêm ảnh mới:', error);
    throw error;
  }
}

export async function deletePhoto(photoId) {
  try {
    const existingPhotos = await getStoredPhotos();
    const updated = existingPhotos.filter((p) => p.id !== photoId);
    await savePhotos(updated);
    return updated;
  } catch (error) {
    console.error('Lỗi khi xoá ảnh:', error);
    throw error;
  }
}

export async function updatePhoto(photoId, updates) {
  try {
    const existingPhotos = await getStoredPhotos();
    const updated = existingPhotos.map((p) =>
      p.id === photoId ? { ...p, ...updates } : p
    );
    await savePhotos(updated);
    return updated;
  } catch (error) {
    console.error('Lỗi khi cập nhật ảnh:', error);
    throw error;
  }
}

export function hasEnvApiKey() {
  const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  return Boolean(envKey && envKey.trim().length > 0);
}

export async function getCustomApiKey() {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEYS.API_KEY)) || '';
  } catch (error) {
    return '';
  }
}

export async function clearCustomApiKey() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.API_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

export async function getStoredApiKey() {
  try {
    const customKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
    if (customKey && customKey.trim().length > 0) {
      return customKey.trim();
    }
    return (process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').trim();
  } catch (error) {
    console.error('Lỗi khi đọc Gemini API Key:', error);
    return (process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').trim();
  }
}

export async function saveStoredApiKey(apiKey) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, apiKey.trim());
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu Gemini API Key:', error);
    return false;
  }
}

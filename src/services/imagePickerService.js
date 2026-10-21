import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export async function requestCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Quyền máy ảnh',
      'Ứng dụng cần quyền truy cập camera để chụp ảnh mới. Vui lòng cấp quyền trong cài đặt thiết bị.'
    );
    return false;
  }
  return true;
}

export async function requestLibraryPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Quyền thư viện ảnh',
      'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh. Vui lòng cấp quyền trong cài đặt thiết bị.'
    );
    return false;
  }
  return true;
}

export async function takePhoto() {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      base64: asset.base64,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    console.error('Lỗi khi chụp ảnh:', error);
    Alert.alert('Lỗi', 'Không thể khởi động camera. Vui lòng thử lại.');
    return null;
  }
}

export async function pickPhoto() {
  const hasPermission = await requestLibraryPermission();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      base64: asset.base64,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    console.error('Lỗi khi chọn ảnh:', error);
    Alert.alert('Lỗi', 'Không thể mở thư viện ảnh. Vui lòng thử lại.');
    return null;
  }
}


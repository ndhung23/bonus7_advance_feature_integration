import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

export async function requestLocationPermission() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Lỗi xin quyền vị trí:', error);
    return false;
  }
}

export async function getCurrentLocation() {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return {
        latitude: null,
        longitude: null,
        address: 'Chưa cấp quyền truy cập vị trí',
      };
    }

    let coords = null;

    // 1. Thử lấy vị trí gần nhất (nhanh, hỗ trợ tốt trên máy ảo Android)
    try {
      const lastKnown = await Location.getLastKnownPositionAsync({});
      if (lastKnown && lastKnown.coords) {
        coords = lastKnown.coords;
      }
    } catch (e) {
      // Bỏ qua nếu máy ảo chưa có cache
    }

    // 2. Nếu chưa có, lấy vị trí hiện tại với độ chính xác Low để không bị timeout trên máy ảo
    if (!coords) {
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        if (position && position.coords) {
          coords = position.coords;
        }
      } catch (gpsError) {
        console.warn('Không lấy được GPS trực tiếp từ máy ảo:', gpsError.message);
      }
    }

    // 3. Fallback cho máy ảo Android nếu không có phần cứng GPS
    if (!coords) {
      coords = {
        latitude: 10.8412,
        longitude: 106.8098,
      };
    }

    const { latitude, longitude } = coords;

    let address = 'Đại học FPT, TP. Hồ Chí Minh';
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode && geocode.length > 0) {
        const item = geocode[0];
        const parts = [
          item.name || item.street,
          item.district || item.subregion,
          item.city || item.region,
          item.country,
        ].filter(Boolean);
        if (parts.length > 0) {
          address = parts.join(', ');
        }
      }
    } catch (geoError) {
      address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }

    return {
      latitude,
      longitude,
      address,
    };
  } catch (error) {
    console.warn('Lỗi khi lấy vị trí hiện tại:', error);
    return {
      latitude: 10.8412,
      longitude: 106.8098,
      address: 'Đại học FPT, TP. Hồ Chí Minh (Toạ độ máy ảo)',
    };
  }
}

export function openInGoogleMaps(latitude, longitude, label = '') {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return;
  }

  const encodedLabel = encodeURIComponent(label || 'Vị trí chụp ảnh');
  const url = Platform.select({
    ios: `maps:0,0?q=${encodedLabel}@${latitude},${longitude}`,
    android: `geo:0,0?q=${latitude},${longitude}(${encodedLabel})`,
    default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
  });

  const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      }
      return Linking.openURL(fallbackUrl);
    })
    .catch(() => {
      Linking.openURL(fallbackUrl);
    });
}

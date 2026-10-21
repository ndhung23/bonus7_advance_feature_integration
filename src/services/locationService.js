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

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;

    let address = 'Không xác định được địa chỉ';
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
      console.warn('Không thể reverse geocode toạ độ:', geoError);
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
      latitude: null,
      longitude: null,
      address: 'Không lấy được vị trí GPS',
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

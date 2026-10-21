export function formatDate(timestamp) {
  if (!timestamp) return 'Không rõ thời gian';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Không rõ thời gian';
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${hours}:${minutes} • ${day}/${month}/${year}`;
  } catch {
    return 'Không rõ thời gian';
  }
}

export function formatCoordinates(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return 'Không có toạ độ';
  }
  const latDir = lat >= 0 ? 'B' : 'N';
  const lngDir = lng >= 0 ? 'Đ' : 'T';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

export function truncate(text, maxLength = 80) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

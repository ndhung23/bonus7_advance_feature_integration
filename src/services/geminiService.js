import { getStoredApiKey } from './storageService';

// Danh sách các model theo thứ tự ưu tiên
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-1.5-flash',
];

export async function generateImageDescription(base64Image, customApiKey = null) {
  // Lấy API key theo thứ tự: 1. Tham số truyền vào, 2. AsyncStorage, 3. Biến môi trường .env
  let apiKey = customApiKey;
  if (!apiKey) {
    apiKey = await getStoredApiKey();
  }
  if (!apiKey) {
    apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  }
  apiKey = (apiKey || '').trim();

  if (!apiKey) {
    throw new Error(
      'Chưa cấu hình Gemini API Key. Vui lòng kiểm tra file .env hoặc bấm nút 🔑 API Key để nhập key.'
    );
  }

  // Chuẩn hóa dữ liệu Base64
  let cleanBase64 = base64Image;
  if (cleanBase64 && cleanBase64.includes(',')) {
    cleanBase64 = cleanBase64.split(',')[1];
  }

  const promptText =
    'Hãy quan sát và mô tả bức ảnh này bằng tiếng Việt trong 2-3 câu ngắn gọn, tự nhiên: gồm đối tượng chính, không gian bối cảnh và cảm xúc.';

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: cleanBase64,
                  },
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || response.statusText || `Lỗi HTTP ${response.status}`;

        // Kiểm tra quyền truy cập 403
        if (response.status === 403 || errorMsg.includes('denied access') || errorMsg.includes('PERMISSION_DENIED')) {
          throw new Error(
            'Google báo lỗi: Project của API Key này bị từ chối truy cập (403 Permission Denied). Vui lòng tạo key mới tại https://aistudio.google.com/app/apikey'
          );
        }

        // Nếu model không tồn tại hoặc đã bị đổi, thử model tiếp theo
        if (response.status === 404 || errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('no longer available')) {
          lastError = new Error(errorMsg);
          continue;
        }

        throw new Error(errorMsg);
      }

      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || '')
          .join('')
          .trim() ||
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!text) {
        throw new Error('Gemini không phản hồi văn bản mô tả.');
      }

      return text;
    } catch (err) {
      lastError = err;
      if (err.message && (err.message.includes('403') || err.message.includes('API key not valid') || err.message.includes('PERMISSION_DENIED'))) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Không thể kết nối đến Gemini AI. Vui lòng kiểm tra lại mạng hoặc API Key.');
}

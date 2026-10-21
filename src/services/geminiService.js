import { getStoredApiKey } from './storageService';

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

export async function generateImageDescription(base64Image, customApiKey = null) {
  const apiKey = (customApiKey || (await getStoredApiKey()) || '').trim();

  if (!apiKey) {
    throw new Error(
      'Chưa cấu hình Gemini API Key. Vui lòng bấm vào biểu tượng chìa khóa ở góc trên để nhập API Key.'
    );
  }

  // Remove data URL prefix if present
  let cleanBase64 = base64Image;
  if (cleanBase64.includes(',')) {
    cleanBase64 = cleanBase64.split(',')[1];
  }

  const promptText =
    'Hãy miêu tả chi tiết bức ảnh này bằng tiếng Việt: gồm đối tượng chính, bối cảnh, màu sắc và cảm xúc (khoảng 2-3 câu ngắn gọn, truyền cảm hứng).';

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        const errorMsg = data?.error?.message || response.statusText || 'Lỗi từ Gemini API';
        // If it's model not found, try next model
        if (response.status === 404 || errorMsg.includes('not found')) {
          lastError = new Error(errorMsg);
          continue;
        }
        throw new Error(errorMsg);
      }

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        'Không thể nhận diện nội dung từ ảnh.';

      return text;
    } catch (err) {
      lastError = err;
      if (err.message && err.message.includes('API Key')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Không thể kết nối đến Gemini AI. Vui lòng thử lại sau.');
}

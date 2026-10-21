# SnapAI Lens - Ứng dụng Chụp, Phân Tích Ảnh bằng Gemini AI & Định Vị Google Maps

> **Bài tập môn MMA301 - React Native (JavaScript) cho Android & iOS**

---

## 📱 Giới thiệu tổng quan

**SnapAI Lens** là ứng dụng di động đa nền tảng (iOS & Android) được xây dựng hoàn toàn bằng **React Native (JavaScript)** và hệ sinh thái **Expo**, tích hợp công nghệ AI đa phương thức và dịch vụ bản đồ vị trí:

1. 📸 **Image Picker**: Chụp ảnh trực tiếp từ camera hoặc chọn ảnh từ thư viện ảnh thiết bị với độ phân giải cao và nén tối ưu.
2. 📍 **Tích hợp Google Map**:
   - Tự động lấy tọa độ GPS (Latitude, Longitude) và địa chỉ thực tế (Reverse Geocoding) ngay khi chụp/chọn ảnh qua `expo-location`.
   - Hiển thị vị trí bức ảnh trên bản đồ tương tác với Marker.
   - Tab **Bản đồ tổng quan**: Ghim tất cả các bức ảnh đã chụp lên cùng một bản đồ, chạm vào ghim để xem trước ảnh và mở chi tiết.
   - Tích hợp nút **Mở trong ứng dụng Google Maps** để chỉ đường và định vị thực tế.
3. 🤖 **Tích hợp Gemini AI Vision**:
   - Tự động gửi ảnh dưới dạng base64 lên **Google Gemini Multimodal API** (`gemini-2.5-flash` / `gemini-1.5-flash`).
   - Sinh mô tả chi tiết bằng tiếng Việt: nhận diện đối tượng chính, không gian bối cảnh, màu sắc và cảm xúc.
   - Hỗ trợ nút **Tạo lại bằng Gemini AI** để phân tích lại nội dung ảnh bất cứ lúc nào.
4. 💾 **Lưu trữ AsyncStorage**:
   - Toàn bộ danh sách ảnh, tọa độ GPS, địa chỉ, mô tả AI và thời gian chụp được lưu trữ cục bộ trên thiết bị qua `@react-native-async-storage/async-storage`.
   - Dữ liệu được bảo toàn vĩnh viễn ngay cả khi tắt ứng dụng hoặc khởi động lại máy.
5. 🗑️ **Quản lý & Xoá ảnh**:
   - Hộp thoại cảnh báo xác nhận trước khi xoá để tránh thao tác nhầm lẫn.
   - Xoá ảnh đồng bộ khỏi giao diện, bản đồ và bộ nhớ AsyncStorage.
6. 🔑 **Bảo mật & Quản lý API Key (Zero-Secret Architecture)**:
   - Không hardcode API Key trong mã nguồn.
   - Hỗ trợ nạp API Key qua biến môi trường `.env` (`EXPO_PUBLIC_GEMINI_API_KEY`).
   - Tích hợp sẵn giao diện **Cấu hình API Key** ngay trong ứng dụng, có nút liên kết trực tiếp đến [Google AI Studio](https://aistudio.google.com/app/apikey) để lấy key miễn phí.

---

## 🛠️ Cấu trúc thư mục mã nguồn

Mã nguồn được phân tách module rõ ràng, tuân thủ nguyên tắc không có file nào vượt quá 1000 dòng:

```
bonus7_advance_feature/
├── assets/                  # Icon, splash screen, adaptive icon
├── src/
│   ├── components/
│   │   ├── ApiKeyModal.js      # Modal cấu hình Gemini API Key
│   │   ├── EmptyState.js       # Giao diện khi chưa có ảnh nào
│   │   ├── Header.js           # Thanh tiêu đề, đếm ảnh, nút chuyển tab
│   │   ├── PhotoCard.js        # Card hiển thị từng bức ảnh trong danh sách
│   │   ├── PhotoDetailModal.js # Modal xem ảnh lớn, đọc mô tả AI & bản đồ
│   │   └── PhotoMapView.js     # Component hiển thị bản đồ Google Map & Marker
│   ├── screens/
│   │   ├── GalleryScreen.js    # Màn hình danh sách ảnh (Grid/List & Pull-to-refresh)
│   │   └── MapOverviewScreen.js# Màn hình bản đồ tổng hợp tất cả các ảnh đã ghim
│   ├── services/
│   │   ├── geminiService.js    # Dịch vụ gọi Gemini Multimodal Vision API
│   │   ├── imagePickerService.js # Dịch vụ xin quyền và chụp/chọn ảnh
│   │   ├── locationService.js  # Dịch vụ GPS, Geocoding & mở Google Maps
│   │   └── storageService.js   # Dịch vụ lưu trữ dữ liệu bằng AsyncStorage
│   ├── styles/
│   │   └── theme.js            # Bảng màu, typography và spacing chuẩn
│   └── utils/
│       └── formatters.js       # Hàm format ngày giờ, tọa độ địa lý
├── .env.example             # Mẫu cấu hình biến môi trường
├── App.js                   # Root Component điều phối luồng ứng dụng
├── app.json                 # Cấu hình quyền Android & iOS cho Expo
├── eas.json                 # Cấu hình EAS Build xuất file APK Android
└── package.json
```

---

## 🚀 Hướng dẫn cài đặt và chạy ứng dụng

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Cấu hình Gemini API Key

- Tạo file `.env` từ file mẫu `.env.example`:
  ```bash
  cp .env.example .env
  ```
- Hoặc mở ứng dụng trên điện thoại, bấm nút **🔑 API Key** ở góc trên bên phải để dán API Key trực tiếp.

### 3. Chạy môi trường phát triển (Expo)

```bash
npx expo start
```

- Nhấn phím `a` để chạy trên Android Emulator.
- Nhấn phím `i` để chạy trên iOS Simulator.
- Hoặc quét mã QR bằng ứng dụng **Expo Go** trên điện thoại thật (Android hoặc iOS).

---

## 📦 Hướng dẫn Build file APK Android độc lập (EAS Build)

Dự án đã được cấu hình sẵn trong `eas.json` với profile `preview` và `production` sử dụng `"buildType": "apk"` để tạo trực tiếp file cài đặt `.apk`:

### Bước 1: Đăng nhập Expo CLI (nếu chưa có)

```bash
npx eas-cli login
```

### Bước 2: Chạy lệnh build file APK

```bash
npx eas-cli build -p android --profile preview
```

### Bước 3: Tải file APK trực tuyến

Sau khi quá trình build trên đám mây của Expo hoàn tất:
1. Terminal sẽ in ra **đường link download trực tiếp file `.apk`** trên trang `expo.dev`.
2. Bạn có thể gửi đường link này hoặc quét mã QR hiển thị trên terminal để cài đặt file APK trực tiếp lên bất kỳ thiết bị Android nào.

---

## 🌐 Hướng dẫn nộp bài Online Link

Để nộp link bài tập:
1. **Link GitHub Repository**: Đẩy toàn bộ mã nguồn lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete photo review app with Google Maps, Gemini AI, ImagePicker, AsyncStorage"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. **Link Download file APK**: Đính kèm đường link build của Expo (EAS Build) hoặc tải file `.apk` đính kèm vào mục **Releases** của GitHub repository.


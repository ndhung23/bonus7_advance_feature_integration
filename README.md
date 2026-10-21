# Bonus 7 - Photo Journal: Google Maps, Gemini AI & AsyncStorage Integration

> **Môn học:** MMA301 - Lập trình di động đa nền tảng (React Native / Expo)  
> **Chủ đề:** Chụp và xem lại ảnh, Định vị Google Maps, Tích hợp Gemini AI Vision và Lưu trữ AsyncStorage

---

## 🌐 Danh sách Đường Link Nộp bài (Submission Links)

| Nội dung | Đường dẫn (URL) | Ghi chú |
| :--- | :--- | :--- |
| 📱 **Link Tải File Cài Đặt Android (APK)** | [**👉 Tải trực tiếp file APK (Bản hoàn chỉnh)**](https://expo.dev/artifacts/eas/QdD1EXHBOPhHv1TtqDZhT6a8bdBbJVXHgjXZz-I5SFw.apk) | File APK độc lập (cài đặt trực tiếp lên điện thoại Android) |
| 🚀 **Link Ứng Dụng Web Chạy Trực Tiếp** | [**https://bonus7advancefeature.expo.app**](https://bonus7advancefeature.expo.app) | Bản React Native Web deploy qua EAS Hosting |
| 💻 **Link Mã Nguồn (GitHub Repository)** | [https://github.com/ndhung23/bonus7_advance_feature_integration](https://github.com/ndhung23/bonus7_advance_feature_integration) | Source code công khai, quản lý commit và tài liệu hướng dẫn chuẩn |
| ⚙️ **Link Theo Dõi EAS Build (Expo Cloud)** | [Trang Build EAS Android APK (Finished)](https://expo.dev/accounts/ndhung23/projects/bonus7advancefeature/builds/a7cd9a6e-3d2a-47ed-ad0e-bbaffccdcbd8) | Tiến trình build thành công artifact APK trên Expo Cloud |
| 📊 **Link Expo Project Dashboard** | [Expo Project Overview](https://expo.dev/accounts/ndhung23/projects/bonus7advancefeature) | Trang quản lý dự án chính thức trên nền tảng Expo |

---

## 📋 Các Chức Năng Đã Hoàn Thành Theo Đề Bài

### 1. Chụp và Chọn Ảnh (Image Picker)
- **Chụp ảnh trực tiếp từ Camera:** Tích hợp `expo-image-picker` (`launchCameraAsync`), tự động xin quyền truy cập máy ảnh và xử lý chuyển đổi ảnh Base64.
- **Chọn ảnh từ Thư viện (Gallery):** Hỗ trợ chọn ảnh có sẵn trên máy (`launchImageLibraryAsync`) với độ phân giải cao và tỷ lệ hiển thị chuẩn.
- **Tối ưu dung lượng:** Nén ảnh nhẹ nhàng và tối ưu Base64 phục vụ gửi yêu cầu phân tích hình ảnh đa phương thức (Multimodal).

### 2. Tích hợp Google Maps & Định Vị Vị Trí Chụp Ảnh
- **Lấy tọa độ GPS tự động:** Sử dụng `expo-location` để lấy vĩ độ (Latitude), kinh độ (Longitude) và giải mã địa chỉ thực tế (Reverse Geocoding) ngay khi lưu ảnh.
- **Nhúng bản đồ Google Maps vào App:** Tích hợp `react-native-webview` (trên Mobile) và `iframe` (trên Web) hiển thị trực tiếp Google Maps Embed kèm Marker ghim vị trí chụp ảnh, hoạt động mượt mà 100% không lo lỗi Google Play Services.
- **Tab Bản đồ tổng quan (Map Overview):** Ghim tất cả các bức ảnh đã chụp lên một bản đồ chung; khi chạm vào từng Marker sẽ hiển thị thẻ xem trước ảnh và cho phép chuyển nhanh tới chi tiết.
- **Mở ngoài Google Maps:** Cung cấp nút tiện ích **"Mở trong Google Maps"** gọi Native Deep Link dẫn đường trực tiếp trên ứng dụng Google Maps chính thức của thiết bị.

### 3. Tích hợp Google Gemini AI Phân Tích & Sinh Mô Tả Ảnh
- **Phân tích hình ảnh đa phương thức (Vision API):** Gửi dữ liệu ảnh dạng Base64 lên Google Generative Language API để nhận diện đối tượng chính, không gian bối cảnh, màu sắc và cảm xúc bằng tiếng Việt.
- **Chủ động sinh mô tả (On-demand AI Generation):** Khi chụp ảnh chỉ lưu ảnh và GPS tức thì; chỉ khi người dùng bấm nút **"✨ Bấm để Gemini AI tạo mô tả"** thì mới gọi AI, giúp tiết kiệm quota API và tạo trải nghiệm mượt mà không bị nghẽn giao diện.
- **Tạo lại mô tả linh hoạt:** Nút **"🔄 Tạo lại"** cho phép yêu cầu Gemini AI phân tích lại nội dung ảnh bất cứ khi nào.
- **Bảo mật tuyệt đối (Zero-Secret):**
  - Không hardcode API Key trong mã nguồn.
  - Tự động nạp qua biến môi trường `.env` (`EXPO_PUBLIC_GEMINI_API_KEY`).
  - Giao diện cấu hình **🔑 API Key** trong app bảo vệ an toàn: ẩn hoàn toàn chuỗi key từ `.env`, hỗ trợ chế độ ẩn mật khẩu `••••••••` kèm nút con mắt `👁️` khi nhập key tùy chỉnh.

### 4. Lưu Trữ Dữ Liệu Bền Vững Với AsyncStorage
- **Lưu trữ dữ liệu toàn diện:** Sử dụng `@react-native-async-storage/async-storage` để lưu danh sách ảnh, tọa độ GPS, thời gian chụp, mô tả AI và thiết lập key.
- **Bảo toàn dữ liệu vĩnh viễn:** Đảm bảo khi tắt ứng dụng hoặc khởi động lại thiết bị thì toàn bộ nhật ký ảnh và vị trí chụp vẫn hiển thị nguyên vẹn.

### 5. Quản Lý & Xoá Ảnh An Toàn
- **Hộp thoại xác nhận (Confirmation Alert):** Luôn hiển thị cảnh báo trước khi xoá để tránh thao tác nhầm.
- **Đồng bộ tức thì:** Xoá đồng bộ ảnh khỏi giao diện danh sách, bản đồ tổng quan và dọn dẹp sạch sẽ trong AsyncStorage.

### 6. Tối Ưu Giao Diện & Trải Nghiệm (UI/UX Mobile-First & Cross-Platform)
- **Né tai thỏ & Dynamic Island chuẩn xác:** Tích hợp `react-native-safe-area-context` với `<SafeAreaProvider>` và `useSafeAreaInsets()`, Header và Modal chi tiết tự động căn khoảng cách an toàn, không bị che khuất bởi tai thỏ hay thanh trạng thái.
- **Né thanh điều hướng Home Indicator:** Các nút bấm nổi (Floating Action Buttons) tự động đẩy lên cách thanh điều hướng đáy máy.
- **Tương thích hoàn hảo cả Android, iOS & Web:** Hỗ trợ phím tắt khởi động máy ảo nhanh chóng (`run-emulator.bat`) và hỗ trợ nền tảng Web thông qua các component chuyên biệt `.web.js`.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
bonus7_advance_feature/
├── src/
│   ├── components/
│   │   ├── ApiKeyModal.js        # Modal cấu hình và bảo mật Gemini API Key
│   │   ├── EmptyState.js         # Giao diện hiển thị khi danh sách ảnh trống
│   │   ├── Header.js             # Thanh tiêu đề tự động né tai thỏ & chuyển Tab
│   │   ├── PhotoCard.js          # Thẻ hiển thị ảnh, địa chỉ GPS & nút gọi AI
│   │   ├── PhotoDetailModal.js   # Modal xem ảnh lớn, đọc mô tả AI & xem bản đồ
│   │   ├── PhotoMapView.js       # Component nhúng bản đồ Google Maps cho Mobile
│   │   └── PhotoMapView.web.js   # Component nhúng bản đồ Google Maps Iframe cho Web
│   ├── screens/
│   │   ├── GalleryScreen.js      # Màn hình danh sách ảnh (Pull-to-refresh)
│   │   ├── MapOverviewScreen.js  # Màn hình bản đồ tổng hợp cho Mobile
│   │   └── MapOverviewScreen.web.js # Màn hình bản đồ tổng hợp cho Web
│   ├── services/
│   │   ├── geminiService.js      # Logic gọi Google Gemini Multimodal Vision API
│   │   ├── imagePickerService.js # Quản lý quyền và chụp/chọn ảnh từ thiết bị
│   │   ├── locationService.js    # Logic lấy GPS, Reverse Geocoding & Deep Link Google Maps
│   │   └── storageService.js     # Quản lý đọc/ghi dữ liệu bền vững bằng AsyncStorage
│   ├── styles/
│   │   └── theme.js              # Bảng màu, typography và khoảng cách chuẩn
│   └── utils/
│       └── formatters.js         # Định dạng ngày giờ và toạ độ địa lý (Vĩ độ / Kinh độ)
├── App.js                        # Root Component, bọc SafeAreaProvider & điều phối luồng
├── app.json                      # Cấu hình Expo, quyền Android/iOS, Package Name & Project ID
├── eas.json                      # Cấu hình EAS Build xuất file APK Android độc lập
├── package.json                  # Dependencies và scripts dự án
├── run-emulator.bat              # Script khởi động nhanh máy ảo Android trên màn hình
└── README.md                     # Tài liệu hướng dẫn & link nộp bài
```

---

## 🚀 Hướng Dẫn Chạy Dự Án Tại Local

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường (`.env`):**
   Tạo file `.env` tại thư mục gốc với Gemini API Key:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...
   ```
   *(Hoặc có thể bấm vào nút **🔑 API Key** trực tiếp ngay trên giao diện ứng dụng)*

3. **Chạy ứng dụng:**
   - **Mở trên máy ảo Android (có sẵn):**
     ```powershell
     npm run emu
     ```
     *(Chiếc điện thoại Android sẽ hiện ngay trên màn hình máy tính)*
   - **Chạy Expo Dev Server:**
     ```bash
     npx expo start
     ```
     - Nhấn phím `a` để nạp app vào máy ảo Android.
     - Nhấn phím `i` để mở trên iOS Simulator.
     - Quét mã QR bằng app **Expo Go** trên điện thoại thật.
   - **Mở trên Web:**
     ```bash
     npm run web
     ```

---

## 📦 Hướng Dẫn Build File Cài Đặt Android (APK)

Dự án đã được thiết lập sẵn file `eas.json` với cấu hình `"buildType": "apk"`:

```bash
# Đăng nhập tài khoản Expo (nếu chưa đăng nhập)
npx eas-cli login

# Chạy build file APK độc lập trên Expo Cloud
npx eas-cli build -p android --profile preview
```

Sau khi hoàn tất, hệ thống sẽ trả về đường link tải file `.apk` trực tiếp trên trang `expo.dev`.

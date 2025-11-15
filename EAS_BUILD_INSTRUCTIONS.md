# Câu 11: EAS Build Instructions

## Bước 1: Cài đặt EAS CLI

```bash
npm install -g eas-cli
```

## Bước 2: Đăng nhập Expo

```bash
eas login
```

## Bước 3: Cấu hình EAS

```bash
eas build:configure
```

## Bước 4: Tạo preview build

```bash
eas build --platform android --profile preview
```

hoặc cho iOS:

```bash
eas build --platform ios --profile preview
```

## Bước 5: Lấy link preview

Sau khi build hoàn tất, EAS sẽ cung cấp link để tải xuống và test ứng dụng.
Link này sẽ được lưu vào file `eas-preview-link.txt`

## Ghi chú

-   Preview build cho phép test ứng dụng trên thiết bị thật mà không cần đăng lên Store
-   Build có thể mất 10-20 phút tùy vào platform
-   Cần có tài khoản Expo (miễn phí) để sử dụng EAS build

# VIP Booking Frontend

Frontend của VIP Booking được xây bằng React, TypeScript và Vite. App dùng dữ liệu demo trong browser storage để mô phỏng luồng đặt phòng, thanh toán, profile khách hàng và dashboard quản trị.

## Chạy local

```bash
npm install
npm run dev
```

Mở trình duyệt tại:

```text
http://localhost:5173
```

## Environment

Tạo file `.env` nếu cần cấu hình API hoặc OAuth:

```env
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APPLE_CLIENT_ID=your-apple-service-id
VITE_APPLE_REDIRECT_URI=http://localhost:5173/login
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run preview
```

## Route chính

- `/home`
- `/rooms`
- `/rooms/:roomId`
- `/booking-information`
- `/confirm-booking`
- `/secure-payment`
- `/profile`
- `/login`
- `/register`
- `/admin`
- `/admin/bookings`
- `/admin/room-types`
- `/admin/services`
- `/admin/pricing`
- `/admin/customers`

## UI

- Client routes có header/footer chung.
- Admin routes dùng admin layout riêng.
- Auth routes dùng header/footer chung nhưng form auth riêng.
- Dark mode và light mode được lưu bằng `localStorage`.


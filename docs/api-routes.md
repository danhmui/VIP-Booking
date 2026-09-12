# VIP-Booking API Routes

Base URL local:

```txt
http://localhost:8080
```

Header mac dinh khi route can dang nhap:

```txt
Authorization: Bearer <token>
Content-Type: application/json
```

Quy uoc quyen:

| Quyen | Y nghia |
| --- | --- |
| Public | Khong can token |
| Authenticated | Can token hop le |
| Owner/Admin | Chu so huu tai nguyen hoac admin |
| Admin | Chi admin |

Response thanh cong dung chung:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Response loi dung chung:

```json
{
  "success": false,
  "message": "Thong bao loi"
}
```

## Health check

| Method | Endpoint | Quyen | Chuc nang |
| --- | --- | --- | --- |
| GET | `/health` | Public | Kiem tra API dang chay |

## Auth

File router: `backend/src/routes/auth.route.js`

| Method | Endpoint | Quyen | Chuc nang |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Dang ky tai khoan customer |
| POST | `/api/auth/login` | Public | Dang nhap va nhan token |
| GET | `/api/auth/me` | Authenticated | Lay thong tin user hien tai tu token |
| POST | `/api/auth/logout` | Authenticated | Dang xuat phia client |

`POST /api/auth/register`

```json
{
  "email": "customer@example.com",
  "password": "Customer123",
  "fullName": "Nguyen Van A",
  "phone": "0900111222"
}
```

`POST /api/auth/login`

```json
{
  "email": "customer@example.com",
  "password": "Customer123"
}
```

## Roles

File router: `backend/src/routes/role.route.js`

| Method | Endpoint | Quyen | Chuc nang |
| --- | --- | --- | --- |
| GET | `/api/roles` | Admin | Lay danh sach vai tro |
| GET | `/api/roles/:id` | Admin | Xem chi tiet vai tro |
| POST | `/api/roles` | Admin | Tao vai tro |
| PATCH | `/api/roles/:id` | Admin | Cap nhat vai tro |
| DELETE | `/api/roles/:id` | Admin | Xoa vai tro |

Body tao/cap nhat:

```json
{
  "role_name": "customer",
  "description": "Khach hang"
}
```

## Users

File router: `backend/src/routes/user.route.js`

| Method | Endpoint | Quyen | Chuc nang |
| --- | --- | --- | --- |
| GET | `/api/users` | Admin | Lay danh sach nguoi dung |
| GET | `/api/users/:id` | Owner/Admin | Xem chi tiet nguoi dung |
| POST | `/api/users` | Admin | Tao nguoi dung thu cong |
| PATCH | `/api/users/:id` | Owner/Admin | Cap nhat nguoi dung |
| DELETE | `/api/users/:id` | Admin | Xoa nguoi dung |

Query ho tro:

```txt
/api/users?search=nguyen&status=active&roleId=2
```

Body tao:

```json
{
  "email": "admin-created@example.com",
  "password": "AdminCreated123",
  "full_name": "Tran Thi B",
  "phone": "0900222333",
  "status": "active",
  "role_id": "2"
}
```

Body cap nhat:

```json
{
  "full_name": "Nguyen Van A",
  "phone": "0900333444",
  "status": "active",
  "role_id": "1"
}
```

Ghi chu: customer chi duoc xem/cap nhat chinh user cua minh. Customer khong duoc tu cap nhat `status` va `role_id`.

## Room types

File router: `backend/src/routes/roomType.route.js`

| Method | Endpoint | Quyen | Chuc nang |
| --- | --- | --- | --- |
| GET | `/api/room-types` | Public | Lay danh sach loai phong |
| GET | `/api/room-types/:id` | Public | Xem chi tiet loai phong |
| POST | `/api/room-types` | Admin | Tao loai phong |
| PATCH | `/api/room-types/:id` | Admin | Cap nhat loai phong |
| DELETE | `/api/room-types/:id` | Admin | Xoa loai phong |

Query ho tro:

```txt
/api/room-types?search=deluxe
```

Body tao/cap nhat:

```json
{
  "room_type_name": "Deluxe",
  "price": "850000",
  "capacity": 2,
  "description": "Phong Deluxe cho 2 nguoi"
}
```

## Rooms

File router: `backend/src/routes/room.route.js`

| Method | Endpoint | Quyen | Chuc nang |
| --- | --- | --- | --- |
| GET | `/api/rooms` | Public | Lay danh sach phong |
| GET | `/api/rooms/:id` | Public | Xem chi tiet phong |
| POST | `/api/rooms` | Admin | Tao phong |
| PATCH | `/api/rooms/:id` | Admin | Cap nhat phong |
| DELETE | `/api/rooms/:id` | Admin | Xoa phong |

Query ho tro:

```txt
/api/rooms?search=A1&status=available&typeId=1&floor=1&capacity=2
```

Body tao/cap nhat:

```json
{
  "room_number": "A101",
  "floor": 1,
  "status": "available",
  "description": "Phong gan thang may",
  "image_url": null,
  "type_id": "1"
}
```

Gia tri `status`: `available`, `booked`, `occupied`, `maintenance`.

## Services

File router: `backend/src/routes/service.route.js`

| Method | Endpoint | Quyen | Chuc nang |
| --- | --- | --- | --- |
| GET | `/api/services` | Public | Lay danh sach dich vu |
| GET | `/api/services/:id` | Public | Xem chi tiet dich vu |
| POST | `/api/services` | Admin | Tao dich vu |
| PATCH | `/api/services/:id` | Admin | Cap nhat dich vu |
| DELETE | `/api/services/:id` | Admin | Xoa dich vu |

Query ho tro:

```txt
/api/services?search=spa&status=active
```

Body tao/cap nhat:

```json
{
  "service_name": "Breakfast",
  "description": "Bua sang tai khach san",
  "unit_price": "150000",
  "unit": "person",
  "status": "active",
  "duration": null
}
```

Gia tri `status`: `active`, `inactive`.

## Bookings

File router: `backend/src/routes/booking.route.js`

| Method | Endpoint | Quyen | Chuc nang |
| --- | --- | --- | --- |
| GET | `/api/bookings` | Authenticated | Lay danh sach dat phong |
| GET | `/api/bookings/:id` | Owner/Admin | Xem chi tiet dat phong |
| POST | `/api/bookings` | Authenticated | Tao dat phong |
| PATCH | `/api/bookings/:id` | Owner/Admin | Cap nhat dat phong |
| DELETE | `/api/bookings/:id` | Owner/Admin | Xoa dat phong |

Query ho tro:

```txt
/api/bookings?userId=5&status=confirmed
```

Body customer tao booking:

```json
{
  "check_in_date": "2026-07-10",
  "check_out_date": "2026-07-12",
  "guest_count": 2,
  "special_request": "Phong tang cao",
  "rooms": [
    {
      "room_id": "1"
    }
  ]
}
```

Body admin tao booking cho khach:

```json
{
  "user_id": "5",
  "check_in_date": "2026-07-10",
  "check_out_date": "2026-07-12",
  "guest_count": 2,
  "status": "confirmed",
  "rooms": [
    {
      "room_id": "1",
      "price_per_night": "850000",
      "number_of_nights": 2,
      "note": "Phong uu tien"
    }
  ]
}
```

Gia tri `status`: `pending`, `confirmed`, `checked_in`, `checked_out`, `cancelled`.

## Check-in/check-out

File router: `backend/src/routes/checkInOut.route.js`

| Method | Endpoint | Quyen | Chuc nang |
| --- | --- | --- | --- |
| GET | `/api/check-in-out` | Admin | Lay danh sach check-in/check-out |
| GET | `/api/check-in-out/:id` | Admin | Xem chi tiet check-in/check-out |
| POST | `/api/check-in-out` | Admin | Tao ban ghi check-in/check-out |
| PATCH | `/api/check-in-out/:id` | Admin | Cap nhat check-in/check-out |
| DELETE | `/api/check-in-out/:id` | Admin | Xoa ban ghi check-in/check-out |

Query ho tro:

```txt
/api/check-in-out?bookingId=1&roomId=1&staffId=2&status=checked_in
```

Body tao/cap nhat:

```json
{
  "booking_id": "1",
  "room_id": "1",
  "staff_id": "2",
  "check_in_time": "2026-07-10T14:00:00.000Z",
  "check_out_time": null,
  "status": "checked_in",
  "note": "Khach da nhan phong"
}
```

Ghi chu: `staff_id` la ten cot hien co trong DB, nhung gia tri phai la `user_id` cua admin.

Gia tri `status`: `checked_in`, `checked_out`.

## Service usages

File router: `backend/src/routes/serviceUsage.route.js`

| Method | Endpoint | Quyen | Chuc nang |
| --- | --- | --- | --- |
| GET | `/api/service-usages` | Admin | Lay danh sach dich vu da su dung |
| GET | `/api/service-usages/:id` | Admin | Xem chi tiet dich vu da su dung |
| POST | `/api/service-usages` | Admin | Ghi nhan dich vu da su dung |
| PATCH | `/api/service-usages/:id` | Admin | Cap nhat dich vu da su dung |
| DELETE | `/api/service-usages/:id` | Admin | Xoa dich vu da su dung |

Query ho tro:

```txt
/api/service-usages?bookingId=1&serviceId=1
```

Body tao/cap nhat:

```json
{
  "booking_id": "1",
  "service_id": "1",
  "quantity": 2,
  "unit_price": "150000",
  "used_at": "2026-07-10T18:00:00.000Z",
  "note": "Bua sang cho 2 nguoi"
}
```

## Invoices

File router: `backend/src/routes/invoice.route.js`

| Method | Endpoint | Quyen | Chuc nang |
| --- | --- | --- | --- |
| GET | `/api/invoices` | Admin | Lay danh sach hoa don |
| GET | `/api/invoices/:id` | Admin | Xem chi tiet hoa don |
| POST | `/api/invoices` | Admin | Tao hoa don |
| PATCH | `/api/invoices/:id` | Admin | Cap nhat hoa don |
| DELETE | `/api/invoices/:id` | Admin | Xoa hoa don |

Query ho tro:

```txt
/api/invoices?bookingId=1&status=unpaid
```

Body tao:

```json
{
  "booking_id": "1",
  "invoice_code": "INV-20260710-001",
  "issued_date": "2026-07-10",
  "room_amount": "1700000",
  "service_amount": "300000",
  "surcharge_amount": "0",
  "discount_amount": "0",
  "tax_amount": "0",
  "invoice_status": "unpaid",
  "note": "Hoa don thanh toan",
  "details": [
    {
      "item_type": "room",
      "reference_id": "1",
      "description": "Deluxe A101",
      "quantity": 2,
      "unit_price": "850000",
      "amount": "1700000"
    }
  ]
}
```

Body cap nhat:

```json
{
  "invoice_status": "paid",
  "total_amount": "2000000",
  "note": "Da thanh toan"
}
```

Gia tri `invoice_status`: `unpaid`, `partial_paid`, `paid`, `cancelled`.
Gia tri `details[].item_type`: `room`, `service`, `surcharge`, `discount`.

## Payments

File router: `backend/src/routes/payment.route.js`

| Method | Endpoint | Quyen | Chuc nang |
| --- | --- | --- | --- |
| GET | `/api/payments` | Admin | Lay danh sach thanh toan |
| GET | `/api/payments/:id` | Admin | Xem chi tiet thanh toan |
| POST | `/api/payments` | Admin | Tao thanh toan |
| PATCH | `/api/payments/:id` | Admin | Cap nhat thanh toan |
| DELETE | `/api/payments/:id` | Admin | Xoa thanh toan |

Query ho tro:

```txt
/api/payments?invoiceId=1&staffId=2&status=success
```

Body tao:

```json
{
  "invoice_id": "1",
  "amount": "1700000",
  "payment_method": "cash",
  "status": "success",
  "paid_at": "2026-07-10T20:00:00.000Z",
  "staff_id": "2"
}
```

Body cap nhat:

```json
{
  "amount": "1700000",
  "payment_method": "bank_transfer",
  "status": "success",
  "paid_at": "2026-07-10T20:00:00.000Z",
  "staff_id": "2"
}
```

Ghi chu: `staff_id` la ten cot hien co trong DB, nhung gia tri phai la `user_id` cua admin.

Gia tri `payment_method`: `cash`, `bank_transfer`, `online`.
Gia tri `status`: `pending`, `success`, `failed`, `refunded`.

## Luong nghiep vu chinh

```txt
1. Khach dang ky tai khoan
2. Khach dang nhap va nhan token
3. Khach xem loai phong, phong va dich vu public
4. Khach tao booking
5. Admin xac nhan booking
6. Admin tao check-in
7. Admin ghi nhan service usage neu co
8. Admin tao invoice
9. Admin tao payment
10. Admin cap nhat check-out
```

# VIP-Booking

VIP-Booking la du an dat phong khach san gom:

- Backend: Node.js, Express, Prisma, MySQL
- Frontend: React, TypeScript, Vite, Tailwind CSS

Huong dan nay dung de chay ca backend va frontend tren may local.

## 1. Yeu Cau Moi Truong

Can cai san:

- Node.js
- npm
- MySQL
- Git

Database backend mac dinh:

```txt
Database: vipbooking
Host: localhost
Port: 3306
User: root
Password: 123456
```

Chuoi ket noi mac dinh trong `backend/.env`:

```env
DATABASE_URL="mysql://root:123456@localhost:3306/vipbooking"
```

Neu MySQL cua ban khac user/password/port thi sua lai `backend/.env`.

## 2. Cau Truc Du An

```txt
VIP-Booking/
  backend/
    prisma/migrations/schema.prisma
    src/app.js
    package.json
  frontend/
    src/
    package.json
  docs/
    api-routes.md
  README.md
```

Tai lieu API chi tiet:

```txt
docs/api-routes.md
```

## 3. Cai Dependencies

Mo PowerShell tai thu muc root `D:\Project\VIP-Booking`.

Cai backend:

```powershell
cd D:\Project\VIP-Booking\backend
npm install
```

Cai frontend:

```powershell
cd D:\Project\VIP-Booking\frontend
npm install
```

## 4. Chuan Bi Database MySQL

Dam bao MySQL dang chay va co database:

```sql
CREATE DATABASE IF NOT EXISTS vipbooking;
```

Schema Prisma nam o:

```txt
backend/prisma/migrations/schema.prisma
```

Kiem tra Prisma schema:

```powershell
cd D:\Project\VIP-Booking\backend
npm run prisma:validate
```

Generate Prisma Client:

```powershell
npm run prisma:generate
```

Neu DB moi chua co bang, dong bo schema vao MySQL:

```powershell
npx prisma db push --schema=prisma/migrations/schema.prisma
```

Luu y: lenh tren chi tao/cap nhat cau truc bang. Neu can du lieu mau nhu admin, room, service, booking thi can import SQL dump hoac tu tao du lieu trong MySQL.

## 5. Cau Hinh Backend

File `backend/.env` can co:

```env
PORT=8080
DATABASE_URL="mysql://root:123456@localhost:3306/vipbooking"
JWT_SECRET="VIP_BOOKING_SECRET_KEY_2026"
```

| Bien | Y nghia |
| --- | --- |
| `PORT` | Port backend |
| `DATABASE_URL` | Ket noi MySQL cho Prisma |
| `JWT_SECRET` | Khoa ky JWT token |

## 6. Cau Hinh Frontend

File `frontend/.env` can co:

```env
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APPLE_CLIENT_ID=REPLACE_WITH_APPLE_SERVICE_ID
VITE_APPLE_REDIRECT_URI=http://localhost:5173/login
```

Quan trong nhat la:

```env
VITE_API_URL=http://localhost:8080
```

Neu `VITE_API_URL` de trong, cac request API tu frontend se goi theo cung origin frontend va co the khong toi backend Express.

## 7. Chay Du An

Can mo 2 terminal rieng.

Terminal 1: chay backend

```powershell
cd D:\Project\VIP-Booking\backend
npm run dev
```

Backend chay tai:

```txt
http://localhost:8080
```

Kiem tra backend:

```powershell
Invoke-WebRequest http://localhost:8080/health
```

Response mong doi:

```json
{
  "success": true,
  "message": "VIP-Booking API is running"
}
```

Terminal 2: chay frontend

```powershell
cd D:\Project\VIP-Booking\frontend
npm run dev
```

Frontend chay tai:

```txt
http://localhost:5173
```

Mo trinh duyet vao:

```txt
http://localhost:5173
```

## 8. Scripts

Backend scripts, chay trong `backend`:

| Script | Chuc nang |
| --- | --- |
| `npm run dev` | Chay backend bang nodemon |
| `npm start` | Chay backend bang Node |
| `npm run prisma:validate` | Kiem tra Prisma schema |
| `npm run prisma:generate` | Generate Prisma Client |

Frontend scripts, chay trong `frontend`:

| Script | Chuc nang |
| --- | --- |
| `npm run dev` | Chay Vite dev server |
| `npm run build` | Build production |
| `npm run lint` | Kiem tra ESLint |
| `npm run format` | Format code bang Prettier |
| `npm run preview` | Preview ban build |

## 9. Role Hien Tai

He thong hien chi dung 2 role:

| Role | Y nghia |
| --- | --- |
| `admin` | Quan tri he thong, quan ly user, phong, dich vu, booking, hoa don, thanh toan |
| `customer` | Khach hang, dang ky, dang nhap, xem phong/dich vu va quan ly booking cua minh |

Khong con role `staff`.

Mot so bang van co cot ten `staff_id` nhu `CheckInOut` va `Payment`. Day la ten cot DB hien co, nhung backend da rang buoc gia tri nay phai la `user_id` cua admin.

## 10. Test API Nhanh

Dang ky customer:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/auth/register `
  -ContentType "application/json" `
  -Body '{"email":"customer@example.com","password":"Customer123","fullName":"Nguyen Van A","phone":"0900111222"}'
```

Dang nhap:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/auth/login `
  -ContentType "application/json" `
  -Body '{"email":"customer@example.com","password":"Customer123"}'
```

API can dang nhap dung header:

```txt
Authorization: Bearer <token>
Content-Type: application/json
```

## 11. Loi Thuong Gap

### Backend khong ket noi duoc DB

Kiem tra:

- MySQL da bat chua
- Database `vipbooking` da ton tai chua
- `DATABASE_URL` trong `backend/.env` co dung user/password/port khong

### Port 8080 dang ban

Doi `PORT` trong `backend/.env`, vi du:

```env
PORT=18080
```

Sau do chay lai backend:

```powershell
npm run dev
```

### Frontend khong goi duoc backend

Kiem tra:

- Backend dang chay tai `http://localhost:8080`
- `frontend/.env` co `VITE_API_URL=http://localhost:8080`
- Sau khi sua `.env`, can stop va chay lai `npm run dev` o frontend

### Prisma bao khong tim thay schema

Project nay khong dung duong dan mac dinh `prisma/schema.prisma`.

Dung script co san:

```powershell
npm run prisma:validate
npm run prisma:generate
```

Hoac them schema path:

```powershell
npx prisma validate --schema=prisma/migrations/schema.prisma
```

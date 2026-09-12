import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import roleRoutes from './routes/role.route.js';
import userRoutes from './routes/user.route.js';
import roomTypeRoutes from './routes/roomType.route.js';
import roomRoutes from './routes/room.route.js';
import serviceRoutes from './routes/service.route.js';
import bookingRoutes from './routes/booking.route.js';
import checkInOutRoutes from './routes/checkInOut.route.js';
import serviceUsageRoutes from './routes/serviceUsage.route.js';
import invoiceRoutes from './routes/invoice.route.js';
import paymentRoutes from './routes/payment.route.js';
import { startSepayPolling } from './services/sepay.service.js';

dotenv.config({ quiet: true });

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'JSON body không hợp lệ',
    });
  }

  return next(error);
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VIP-Booking API is running',
  });
});

app.use(authRoutes);
app.use(roleRoutes);
app.use(userRoutes);
app.use(roomTypeRoutes);
app.use(roomRoutes);
app.use(serviceRoutes);
app.use(bookingRoutes);
app.use(checkInOutRoutes);
app.use(serviceUsageRoutes);
app.use(invoiceRoutes);
app.use(paymentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
  startSepayPolling();
});

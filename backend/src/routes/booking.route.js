import express from 'express';
import {
  destroy,
  index,
  show,
  store,
  update,
} from '../controllers/booking.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/api/bookings', requireAuth, index);
router.get('/api/bookings/:id', requireAuth, show);
router.post('/api/bookings', requireAuth, store);
router.patch('/api/bookings/:id', requireAuth, update);
router.delete('/api/bookings/:id', requireAuth, destroy);

export default router;

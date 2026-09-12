import express from 'express';
import {
  destroy,
  index,
  show,
  store,
  update,
} from '../controllers/checkInOut.controller.js';
import { requireAuth, requireRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/api/check-in-out', requireAuth, requireRoles('admin'), index);
router.get('/api/check-in-out/:id', requireAuth, requireRoles('admin'), show);
router.post('/api/check-in-out', requireAuth, requireRoles('admin'), store);
router.patch('/api/check-in-out/:id', requireAuth, requireRoles('admin'), update);
router.delete('/api/check-in-out/:id', requireAuth, requireRoles('admin'), destroy);

export default router;

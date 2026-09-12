import express from 'express';
import {
  destroy,
  index,
  show,
  store,
  update,
} from '../controllers/roomType.controller.js';
import { requireAuth, requireRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/api/room-types', index);
router.get('/api/room-types/:id', show);
router.post('/api/room-types', requireAuth, requireRoles('admin'), store);
router.patch('/api/room-types/:id', requireAuth, requireRoles('admin'), update);
router.delete('/api/room-types/:id', requireAuth, requireRoles('admin'), destroy);

export default router;

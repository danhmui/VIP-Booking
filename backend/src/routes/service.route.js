import express from 'express';
import {
  destroy,
  index,
  show,
  store,
  update,
} from '../controllers/service.controller.js';
import { requireAuth, requireRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/api/services', index);
router.get('/api/services/:id', show);
router.post('/api/services', requireAuth, requireRoles('admin'), store);
router.patch('/api/services/:id', requireAuth, requireRoles('admin'), update);
router.delete('/api/services/:id', requireAuth, requireRoles('admin'), destroy);

export default router;

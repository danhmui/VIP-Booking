import express from 'express';
import {
  destroy,
  index,
  show,
  store,
  update,
} from '../controllers/user.controller.js';
import { requireAuth, requireRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/api/users', requireAuth, requireRoles('admin'), index);
router.get('/api/users/:id', requireAuth, show);
router.post('/api/users', requireAuth, requireRoles('admin'), store);
router.patch('/api/users/:id', requireAuth, update);
router.delete('/api/users/:id', requireAuth, requireRoles('admin'), destroy);

export default router;

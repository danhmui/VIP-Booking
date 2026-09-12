import express from 'express';
import {
  destroy,
  index,
  show,
  store,
  update,
} from '../controllers/role.controller.js';
import { requireAuth, requireRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/api/roles', requireAuth, requireRoles('admin'), index);
router.get('/api/roles/:id', requireAuth, requireRoles('admin'), show);
router.post('/api/roles', requireAuth, requireRoles('admin'), store);
router.patch('/api/roles/:id', requireAuth, requireRoles('admin'), update);
router.delete('/api/roles/:id', requireAuth, requireRoles('admin'), destroy);

export default router;

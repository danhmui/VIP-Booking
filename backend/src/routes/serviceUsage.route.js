import express from 'express';
import {
  destroy,
  index,
  show,
  store,
  update,
} from '../controllers/serviceUsage.controller.js';
import { requireAuth, requireRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/api/service-usages', requireAuth, requireRoles('admin'), index);
router.get('/api/service-usages/:id', requireAuth, requireRoles('admin'), show);
router.post('/api/service-usages', requireAuth, requireRoles('admin'), store);
router.patch('/api/service-usages/:id', requireAuth, requireRoles('admin'), update);
router.delete('/api/service-usages/:id', requireAuth, requireRoles('admin'), destroy);

export default router;

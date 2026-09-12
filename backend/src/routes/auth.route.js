import express from 'express';
import { login, logout, me, register, forgotPassword, resetPassword, verifyResetCode } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/api/auth/register', register);
router.post('/api/auth/login', login);
router.get('/api/auth/me', requireAuth, me);
router.post('/api/auth/logout', requireAuth, logout);

router.post('/api/auth/forgot-password', forgotPassword);
router.post('/api/auth/verify-reset-code', verifyResetCode);
router.post('/api/auth/reset-password', resetPassword);

export default router;

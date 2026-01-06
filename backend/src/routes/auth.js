import express from 'express';
import { register, login, me, forgotPassword, validateResetToken, resetPassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/register', upload.single('photo'), register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/validate-reset-token', validateResetToken);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticateToken, me);

export default router;


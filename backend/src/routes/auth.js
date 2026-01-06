import express from 'express';
import { register, login, me, forgotPassword, validateResetToken, resetPassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/register', (req, res, next) => {
  console.log('=== REGISTER ROUTE ===');
  console.log('Content-Type:', req.headers['content-type']);
  
  // Multer middleware com tratamento de erro
  upload.single('photo')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ message: err.message || 'Erro ao processar arquivo' });
    }
    
    console.log('After multer - Body keys:', Object.keys(req.body || {}));
    console.log('After multer - File:', req.file ? 'Present' : 'Not present');
    
    register(req, res, next);
  });
});
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/validate-reset-token', validateResetToken);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticateToken, me);

export default router;


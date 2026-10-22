import express from 'express';
import { register, login, demoLogin, getMe, getUsers, updateUser } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getMe);

// Admin user administration
router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id', protect, authorize('admin'), updateUser);

export default router;

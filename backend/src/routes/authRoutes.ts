import { Router } from 'express';
import { login, register, getMe, logout } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', getMe);
router.post('/logout', logout);

export default router;

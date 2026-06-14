import { Router } from 'express';
import { login, me, register } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateToken as any, me);

export default router;

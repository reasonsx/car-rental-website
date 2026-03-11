import { Router } from 'express';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';

const router = Router();

// Example route
router.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});


router.use("/auth", authRoutes);   // /api/auth/register, /api/auth/login
router.use("/users", userRoutes);  // /api/users, /api/users/:id

export default router;
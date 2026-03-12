import { Router } from 'express';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import bookingRoutes from './bookingRoutes';
import carRoutes from './carRoutes';

const router = Router();

// Example route
router.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});


router.use("/auth", authRoutes);   // /api/auth/register, /api/auth/login
router.use("/users", userRoutes);  // /api/users, /api/users/:id
router.use("/bookings", bookingRoutes); // /api/bookings, /api/bookings/:id
router.use('/cars', carRoutes);        // /api/cars, /api/cars/:id

export default router;
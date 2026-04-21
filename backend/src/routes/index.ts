import { Router } from "express";

import userRoutes from "../modules/user/user.routes";
import authRoutes from "../modules/auth/auth.routes";
import bookingRoutes from "../modules/booking/booking.routes";
import carRoutes from "../modules/car/car.routes";
import categoryRoutes from "../modules/category/category.routes";
import locationRoutes from "../modules/location/location.routes";

const router = Router();

// Health check
router.get("/ping", (_req, res) => {
  res.json({ message: "pong" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/bookings", bookingRoutes);
router.use("/cars", carRoutes);
router.use("/categories", categoryRoutes);
router.use("/locations", locationRoutes);

export default router;

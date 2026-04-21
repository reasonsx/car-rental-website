import { Router } from "express";

import userRoutes from "../modules/user/user.routes";
import authRoutes from "../modules/auth/auth.routes";
import bookingRoutes from "../modules/booking/booking.routes";
import carRoutes from "../modules/car/car.routes";
import categoryRoutes from "../modules/category/category.routes";
import locationRoutes from "../modules/location/location.routes";

const router = Router();

// ✅ Root route (FIX)
router.get("/", (_req, res) => {
  res.json({
    status: "OK",
    message: "Car Rental API running 🚀",
    version: "v1",
    endpoints: {
      ping: "/api/v1/ping",
      cars: "/api/v1/cars",
      auth: "/api/v1/auth",
      bookings: "/api/v1/bookings",
    },
  });
});

// Health check
router.get("/ping", (_req, res) => {
  res.json({ message: "pong" });
});

// Routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/bookings", bookingRoutes);
router.use("/cars", carRoutes);
router.use("/categories", categoryRoutes);
router.use("/locations", locationRoutes);

export default router;

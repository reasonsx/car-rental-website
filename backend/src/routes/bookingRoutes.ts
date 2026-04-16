import { Router } from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking
} from "../controllers/bookingController";
import { verifyToken } from "../controllers/authController";

const router = Router();

router.post("/", verifyToken, createBooking);
router.get("/", verifyToken, getBookings);
router.get("/:id", verifyToken, getBookingById);
router.put("/:id", verifyToken, updateBooking);
router.delete("/:id", verifyToken, deleteBooking);

export default router;
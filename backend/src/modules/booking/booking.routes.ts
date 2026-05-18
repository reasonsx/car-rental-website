import { Router } from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsForCar,
  confirmBooking,
  getAllBookings,
} from "./booking.controller";
import { verifyToken } from "../auth/auth.controller";

const router = Router();

router.post("/", verifyToken, createBooking);
router.put("/:id/confirm", verifyToken, confirmBooking);
router.get("/", verifyToken, getBookings);
router.put("/:id", verifyToken, updateBooking);
router.delete("/:id", verifyToken, deleteBooking);
router.get("/car/:carId", getBookingsForCar);
router.get("/:id", verifyToken, getBookingById);
router.get("/admin/all", verifyToken, getAllBookings);


export default router;

import { Router } from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking, getBookingsForCar
} from "../controllers/bookingController";
import { verifyToken } from "../controllers/authController";

const router = Router();

router.post("/", verifyToken, createBooking);
router.get("/", verifyToken, getBookings);
router.put("/:id", verifyToken, updateBooking);
router.delete("/:id", verifyToken, deleteBooking);
router.get('/car/:carId', getBookingsForCar);
router.get("/:id", verifyToken, getBookingById);


export default router;
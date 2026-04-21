import { Request, Response } from "express";
import { BookingModel } from "./booking.model";
import { BookingStatus } from "./booking";
import { AuthRequest } from "../auth/auth.controller";

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carId, startDate, endDate]
 *             properties:
 *               carId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Overlapping booking
 */
export async function createBooking(req: AuthRequest, res: Response) {
  try {
    const { carId, startDate, endDate } = req.body;
    const userId = req.user?.id;

    if (!userId || !carId || !startDate || !endDate) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Normalize dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Validate dates
    if (start >= end) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: "Cannot book past dates" });
    }

    // OVERLAP CHECK
    const overlapping = await BookingModel.findOne({
      carId,
      status: { $in: [BookingStatus.Pending, BookingStatus.Confirmed] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (overlapping) {
      return res.status(409).json({
        message: "Car is already booked for selected dates",
      });
    }

    const car = await (await import("../car/car.model")).CarModel.findById(carId);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    const totalPrice = days * car.pricePerDay;

    const booking = new BookingModel({
      userId,
      carId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: BookingStatus.Confirmed,
    });

    const savedBooking = await booking.save();

    res.status(201).json(savedBooking);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get bookings for logged-in user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 */
export async function getBookings(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;

    const bookings = await BookingModel.find({ userId })
      .populate("userId", "name email")
      .populate("carId", "brand modelName pricePerDay imageUrl")
      .lean();

    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking found
 *       404:
 *         description: Not found
 */
export async function getBookingById(req: Request, res: Response) {
  try {
    const booking = await BookingModel.findById(req.params.id)
      .populate("userId", "name email")
      .populate("carId")
      .lean();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /bookings/car/{carId}:
 *   get:
 *     summary: Get bookings for a specific car
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking dates
 */
export async function getBookingsForCar(req: Request, res: Response) {
  try {
    const bookings = await BookingModel.find({
      carId: req.params.carId,
      status: BookingStatus.Confirmed,
    }).select("startDate endDate");

    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       200:
 *         description: Updated booking
 *       404:
 *         description: Not found
 */
export async function updateBooking(req: Request, res: Response) {
  try {
    const updatedBooking = await BookingModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("userId", "name email")
      .populate("carId")
      .lean();

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(updatedBooking);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update booking",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted
 *       404:
 *         description: Not found
 */
export async function deleteBooking(req: Request, res: Response) {
  try {
    const deletedBooking = await BookingModel.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete booking",
      error: error.message,
    });
  }
}

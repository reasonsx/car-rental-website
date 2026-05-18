import { Request, Response } from "express";
import { BookingModel } from "./booking.model";
import { CarModel } from "../car/car.model";
import { BookingStatus } from "./booking";
import { AuthRequest } from "../auth/auth.controller";
import stripe from "../../config/stripe";

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create booking and payment intent
 *     description: Creates a pending booking for the authenticated user and returns a Stripe client secret for payment.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [carId, startDate, endDate, userInfo]
 *             properties:
 *               carId:
 *                 type: string
 *                 example: 65f1c2a9b7f4a8d123456789
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-06-05
 *               userInfo:
 *                 $ref: '#/components/schemas/BookingUserInfo'
 *     responses:
 *       201:
 *         description: Booking created and payment intent generated
 *       400:
 *         description: Missing fields, invalid date range, or past date selected
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Car not found
 *       409:
 *         description: Car already booked for selected dates
 *       500:
 *         description: Failed to create booking
 */
export async function createBooking(req: AuthRequest, res: Response) {
  try {
    const { carId, startDate, endDate, userInfo } = req.body;
    const userId = req.user?.id;

    if (!userId || !carId || !startDate || !endDate || !userInfo) {
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
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

    const car = await CarModel.findById(carId);

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
      status: BookingStatus.Pending,
      userInfo,
    });

    const savedBooking = await booking.save();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // in cents
      currency: "usd",
      metadata: {
        bookingId: savedBooking._id.toString(),
      },
    });

    // Update booking with payment intent id
    savedBooking.paymentIntentId = paymentIntent.id;
    await savedBooking.save();

    res.status(201).json({
      bookingId: savedBooking._id,
      clientSecret: paymentIntent.client_secret,
      totalPrice,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /bookings/{id}/confirm:
 *   put:
 *     summary: Confirm booking after payment
 *     description: Confirms a pending booking owned by the authenticated user.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID
 *         schema:
 *           type: string
 *         example: 65f1c2a9b7f4a8d123456789
 *     responses:
 *       200:
 *         description: Booking confirmed
 *       400:
 *         description: Booking is not pending
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Failed to confirm booking
 */
export async function confirmBooking(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const booking = await BookingModel.findOne({ _id: id, userId });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== BookingStatus.Pending) {
      return res.status(400).json({ message: "Booking is not pending" });
    }

    booking.status = BookingStatus.Confirmed;
    await booking.save();

    res.status(200).json({ message: "Booking confirmed" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to confirm booking",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get bookings
 *     description: Returns bookings for the logged-in user. Admin users receive all bookings.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *       401:
 *         description: Missing or invalid token
 *       500:
 *         description: Failed to fetch bookings
 */
export async function getBookings(req: AuthRequest, res: Response) {
  try {
    const bookings = await BookingModel.find({
      userId: req.user?.id,
    })
      .populate("userId", "name email")
      .populate("carId", "brand modelName pricePerDay imageUrl")
      .sort({ createdAt: -1 })
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
 * /bookings/admin/all:
 *   get:
 *     summary: Get all bookings
 *     description: Returns all bookings in the system. Accessible only by administrators.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admins only
 *       500:
 *         description: Failed to fetch bookings
 */
export async function getAllBookings(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admins only" });
    }

    const bookings = await BookingModel.find()
      .populate("userId", "name email")
      .populate("carId", "brand modelName pricePerDay imageUrl")
      .sort({ createdAt: -1 })
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
 *     description: Returns a single booking by its ID.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID
 *         schema:
 *           type: string
 *         example: 65f1c2a9b7f4a8d123456789
 *     responses:
 *       200:
 *         description: Booking found
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Failed to fetch booking
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
 *     summary: Get unavailable dates for car
 *     description: Returns pending and confirmed bookings for a specific car, useful for disabling unavailable dates in the frontend.
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         description: Car ID
 *         schema:
 *           type: string
 *         example: 65f1c2a9b7f4a8d123456789
 *     responses:
 *       200:
 *         description: List of unavailable booking dates
 *       500:
 *         description: Failed to fetch bookings
 */
export async function getBookingsForCar(req: Request, res: Response) {
  try {
    const bookings = await BookingModel.find({
      carId: req.params.carId,
      status: { $in: [BookingStatus.Confirmed, BookingStatus.Pending] },
    }).select("startDate endDate status");

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
 *     description: Updates a booking by ID. Requires authentication.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID
 *         schema:
 *           type: string
 *         example: 65f1c2a9b7f4a8d123456789
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingUpdateInput'
 *     responses:
 *       200:
 *         description: Booking updated
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Failed to update booking
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
 *     description: Deletes a booking by ID. Requires authentication.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID
 *         schema:
 *           type: string
 *         example: 65f1c2a9b7f4a8d123456789
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Failed to delete booking
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

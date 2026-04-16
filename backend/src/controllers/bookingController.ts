import { Request, Response } from 'express';
import { BookingModel } from '../models/bookingModel';
import { BookingStatus } from '../interfaces/booking';
import {AuthRequest} from "./authController";

/**
 * Create a new booking
 * @route POST /api/bookings
 */
export async function createBooking(req: AuthRequest, res: Response) {
  try {
    const { carId, startDate, endDate, totalPrice } = req.body;

    const userId = req.user?.id;

    if (!userId || !carId || !startDate || !endDate || !totalPrice) {
      return res.status(400).json({
        message: 'Missing required fields'
      });
    }

    const booking = new BookingModel({
      userId,
      carId,
      startDate,
      endDate,
      totalPrice,
      status: BookingStatus.Pending
    });

    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to create booking',
      error: error.message
    });
  }
}

/**
 * Get all bookings
 * @route GET /api/bookings
 */
export async function getBookings(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;

    const bookings = await BookingModel.find({ userId })
        .populate('userId', 'name email')
        .populate('carId', 'brand modelName pricePerDay imageUrl')
        .lean();

    res.status(200).json(bookings);

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
}

/**
 * Get booking by ID
 * @route GET /api/bookings/:id
 */
export async function getBookingById(req: Request, res: Response) {
  try {
    const booking = await BookingModel.findById(req.params.id)
        .populate('userId', 'name email')
        .populate('carId')
        .lean();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
}

/**
 * Update booking by ID
 * @route PUT /api/bookings/:id
 */
export async function updateBooking(req: Request, res: Response) {
  try {
    const updatedBooking = await BookingModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
    )
        .populate('userId', 'name email')
        .populate('carId')
        .lean();

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(updatedBooking);

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to update booking',
      error: error.message
    });
  }
}

/**
 * Delete booking by ID
 * @route DELETE /api/bookings/:id
 */
export async function deleteBooking(req: Request, res: Response) {
  try {
    const deletedBooking = await BookingModel.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      message: 'Booking deleted successfully'
    });

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to delete booking',
      error: error.message
    });
  }
}
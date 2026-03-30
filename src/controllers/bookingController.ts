import { Request, Response } from "express";
import { BookingModel } from "../models/bookingModel";
import { BookingStatus } from "../interfaces/booking";
import { connect, disconnect } from "../repository/database";
import "../models/carModel";
import "../models/userModel";

/**
 * Create booking
 */
export async function createBooking(req: Request, res: Response) {
  try {

    const booking = new BookingModel({
      userId: req.body.userId,
      carId: req.body.carId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      totalPrice: req.body.totalPrice,
      status: BookingStatus.Pending,
    });

    const savedBooking = await booking.save();

    res.status(201).json(savedBooking);

  } catch (error) {
    res.status(500).json({ message: "Failed to create booking: " + error });

  }
}

/**
 * Get all bookings
 */
export async function getBookings(req: Request, res: Response) {
  try {

    const bookings = await BookingModel.find()
      .populate("userId")
      .populate("carId");

    res.status(200).json(bookings);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings: " + error });

  } 
}

/**
 * Get booking by ID
 */
export async function getBookingById(req: Request, res: Response) {
  try {

    const booking = await BookingModel.findById(req.params.id)
      .populate("userId")
      .populate("carId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booking: " + error });

  }
}

/**
 * Update booking
 */
export async function updateBooking(req: Request, res: Response) {
  try {

    const updatedBooking = await BookingModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(updatedBooking);

  } catch (error) {
    res.status(500).json({ message: "Failed to update booking: " + error });

  } 
}

/**
 * Delete booking
 */
export async function deleteBooking(req: Request, res: Response) {
  try {

    const deletedBooking = await BookingModel.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Failed to delete booking: " + error });

  } 
}
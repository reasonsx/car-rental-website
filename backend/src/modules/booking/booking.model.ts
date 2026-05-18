import { Schema, model } from "mongoose";
import { Booking, BookingStatus } from "./booking";

const userInfoSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  driversLicenseNumber: { type: String, required: true },
  driversLicenseExpiry: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
});

const bookingSchema = new Schema<Booking>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  carId: { type: Schema.Types.ObjectId, ref: "Car", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.Pending },
  paymentIntentId: { type: String },
  userInfo: { type: userInfoSchema, required: true },
});

export const BookingModel = model<Booking>("Booking", bookingSchema);

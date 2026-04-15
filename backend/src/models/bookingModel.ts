import { Schema, model } from 'mongoose';
import { Booking, BookingStatus } from '../interfaces/booking';

const bookingSchema = new Schema<Booking>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  carId: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.Pending }
});

export const BookingModel = model<Booking>('Booking', bookingSchema);
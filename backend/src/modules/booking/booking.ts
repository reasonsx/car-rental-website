import { Document, Types } from "mongoose";

export enum BookingStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
}

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  driversLicenseNumber: string;
  driversLicenseExpiry: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface Booking extends Document {
  userId: Types.ObjectId;
  carId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: BookingStatus;
  paymentIntentId?: string;
  userInfo: UserInfo;
}

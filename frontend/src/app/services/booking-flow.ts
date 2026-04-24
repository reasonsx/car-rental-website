import { Injectable, signal } from "@angular/core";
import { Car } from "../models/car.model";

export interface BookingData {
  carId: string;
  startDate: Date;
  endDate: Date;
  car?: Car;
  bookingId?: string;
  clientSecret?: string;
  totalPrice?: number;
}

@Injectable({
  providedIn: "root",
})
export class BookingFlowService {
  private bookingData = signal<BookingData | null>(null);

  setBookingData(data: BookingData) {
    this.bookingData.set(data);
  }

  getBookingData() {
    return this.bookingData();
  }

  updateBookingData(updates: Partial<BookingData>) {
    const current = this.bookingData();
    if (current) {
      this.bookingData.set({ ...current, ...updates });
    }
  }

  clearBookingData() {
    this.bookingData.set(null);
  }
}

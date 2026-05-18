import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Booking } from "../models/booking.model";
import { API_BASE_URL } from "./api.constants";

@Injectable({ providedIn: "root" })
export class BookingService {
  private readonly baseUrl = `${API_BASE_URL}/bookings`;

  constructor(private http: HttpClient) {}

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.baseUrl);
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/admin/all`);
  }

  getBookingsForCar(carId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/car/${carId}`);
  }

  createBooking(data: { carId: string; startDate: Date; endDate: Date; userInfo: any }): Observable<{ bookingId: string; clientSecret: string; totalPrice: number }> {
    return this.http.post<{ bookingId: string; clientSecret: string; totalPrice: number }>(this.baseUrl, data);
  }

  confirmBooking(id: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${id}/confirm`, {});
  }

  updateBooking(id: string, data: Partial<Booking>): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/${id}`, data);
  }

  deleteBooking(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}

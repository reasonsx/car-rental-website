import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { Booking } from "../models/booking.model";
import { API_BASE_URL } from "./api.constants";

@Injectable({ providedIn: "root" })
export class BookingService {
  private readonly baseUrl = `${API_BASE_URL}/bookings`;

  constructor(private http: HttpClient) {}

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.baseUrl);
  }

  getBookingsForCar(carId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/car/${carId}`);
  }

  createBooking(data: { carId: string; startDate: Date; endDate: Date }): Observable<{ bookingId: string; clientSecret: string; totalPrice: number }> {
    const token = localStorage.getItem("token");

    return this.http.post<{ bookingId: string; clientSecret: string; totalPrice: number }>(this.baseUrl, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  confirmBooking(id: string): Observable<{ message: string }> {
    const token = localStorage.getItem("token");

    return this.http.put<{ message: string }>(`${this.baseUrl}/${id}/confirm`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  updateBooking(id: string, data: Partial<Booking>): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/${id}`, data);
  }

  deleteBooking(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}

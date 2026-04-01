import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Booking } from '../models/booking.model';
import { API_BASE_URL } from './api.constants';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly baseUrl = `${API_BASE_URL}/bookings`;

  constructor(private http: HttpClient) {}

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.baseUrl);
  }

  getBookingsForCar(carId: string): Observable<Booking[]> {
    return this.getBookings().pipe(
      map(bookings => bookings.filter(booking => {
        const bookingCarId = booking.carId;
        if (!bookingCarId) return false;

        if (typeof bookingCarId === 'string') {
          return bookingCarId === carId;
        }

        if (typeof bookingCarId === 'object') {
          return bookingCarId._id === carId || (bookingCarId as any)['id'] === carId;
        }

        return false;
      }))
    );
  }
}

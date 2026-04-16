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
    return this.http.get<Booking[]>(`${this.baseUrl}/car/${carId}`);
  }

  createBooking(data: {
    carId: string;
    startDate: Date;
    endDate: Date;
  }): Observable<Booking> {
    return this.http.post<Booking>(this.baseUrl, data);
  }
}

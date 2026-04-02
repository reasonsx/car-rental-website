import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Car } from '../models/car.model';
import { API_BASE_URL } from './api.constants';

@Injectable({ providedIn: 'root' })
export class CarService {
  private readonly baseUrl = `${API_BASE_URL}/cars`;

  constructor(private http: HttpClient) {}

  getCars(): Observable<Car[]> {
    return this.http.get<Car[]>(this.baseUrl);
  }

  getCarById(id: string): Observable<Car> {
    return this.http.get<Car>(`${this.baseUrl}/${id}`);
  }

  createCar(car: Partial<Car>): Observable<Car> {
    return this.http.post<Car>(this.baseUrl, car);
  }

  updateCar(id: string, car: Partial<Car>): Observable<Car> {
    return this.http.put<Car>(`${this.baseUrl}/${id}`, car);
  }

  deleteCar(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}

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
}

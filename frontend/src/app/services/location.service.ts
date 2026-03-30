import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location } from '../models/location.model';
import { API_BASE_URL } from './api.constants';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly baseUrl = `${API_BASE_URL}/locations`;

  constructor(private http: HttpClient) {}

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(this.baseUrl);
  }
}

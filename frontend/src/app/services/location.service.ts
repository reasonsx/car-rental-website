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

  getLocationById(id: string): Observable<Location> {
    return this.http.get<Location>(`${this.baseUrl}/${id}`);
  }

  createLocation(location: Partial<Location>): Observable<Location> {
    return this.http.post<Location>(this.baseUrl, location);
  }

  updateLocation(id: string, location: Partial<Location>): Observable<Location> {
    return this.http.put<Location>(`${this.baseUrl}/${id}`, location);
  }

  deleteLocation(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}

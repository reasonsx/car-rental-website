import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/auth.model';
import { API_BASE_URL } from './api.constants';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${API_BASE_URL}/users`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'auth-token': token || ''
    });
  }

  getAllUsers(): Observable<{ error: null; data: User[] }> {
    return this.http.get<{ error: null; data: User[] }>(this.baseUrl, {
      headers: this.getHeaders()
    });
  }

  getUserById(id: string): Observable<{ error: null; data: User }> {
    return this.http.get<{ error: null; data: User }>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateUser(id: string, user: Partial<User>): Observable<{ error: null; data: User }> {
    return this.http.put<{ error: null; data: User }>(`${this.baseUrl}/${id}`, user, {
      headers: this.getHeaders()
    });
  }

  deleteUser(id: string): Observable<{ error: null; data: string }> {
    return this.http.delete<{ error: null; data: string }>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}

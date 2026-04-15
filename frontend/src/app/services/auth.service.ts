import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { API_BASE_URL } from './api.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${API_BASE_URL}/auth`;

  // Reactive state using signals
  private _currentUser = signal<User | null>(null);
  private _token = signal<string | null>(null);

  // Computed signals
  currentUser = this._currentUser.asReadonly();
  token = this._token.asReadonly();
  isAuthenticated = computed(() => !!this._currentUser());
  isAdmin = computed(() => this._currentUser()?.isAdmin ?? false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        this.setAuthData(response.data.token, response.data.user);
        this.router.navigate(['/']);
      }),
      catchError(error => {
        console.error('Login failed:', error);
        throw error;
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData).pipe(
      tap(() => {
        // After successful registration, redirect to auth
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error('Registration failed:', error);
        throw error;
      })
    );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  updateUser(userData: Partial<User>): Observable<User> {
    const token = this._token();
    if (!token) throw new Error('No authentication token');

    const headers = new HttpHeaders().set('auth-token', token);
    const userId = this._currentUser()?.id;

    return this.http.put<User>(`${API_BASE_URL}/users/${userId}`, userData, { headers }).pipe(
      tap(updatedUser => {
        // Update the current user signal
        const currentUser = this._currentUser();
        if (currentUser) {
          this._currentUser.set({ ...currentUser, ...updatedUser });
        }
      }),
      catchError(error => {
        console.error('Update user failed:', error);
        throw error;
      })
    );
  }

  private setAuthData(token: string, user: User): void {
    this._token.set(token);
    this._currentUser.set(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private clearAuthData(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('authToken');
    const userJson = localStorage.getItem('currentUser');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this._token.set(token);
        this._currentUser.set(user);
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        this.clearAuthData();
      }
    }
  }
}

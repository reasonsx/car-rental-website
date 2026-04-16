import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse
} from '../models/auth.model';
import { API_BASE_URL } from './api.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${API_BASE_URL}/auth`;

  private _currentUser = signal<User | null>(null);
  private _token = signal<string | null>(null);

  currentUser = this._currentUser.asReadonly();
  token = this._token.asReadonly();

  isAuthenticated = computed(() => !!this._token());
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
        void this.router.navigate(['/']);
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData).pipe(
      tap(() => {
        void this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error('Registration failed:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearAuthData();
    void this.router.navigate(['/login']);
  }

  updateUser(userData: Partial<User>): Observable<User> {
    const userId = this._currentUser()?.id;

    if (!userId) {
      return throwError(() => new Error('User not found'));
    }

    return this.http.put<User>(`${API_BASE_URL}/users/${userId}`, userData).pipe(
      tap(updatedUser => {
        const currentUser = this._currentUser();
        if (currentUser) {
          const merged = { ...currentUser, ...updatedUser };
          this._currentUser.set(merged);
          localStorage.setItem('currentUser', JSON.stringify(merged));
        }
      }),
      catchError(error => {
        console.error('Update user failed:', error);
        return throwError(() => error);
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
        const user: User = JSON.parse(userJson);
        this._token.set(token);
        this._currentUser.set(user);
      } catch {
        this.clearAuthData();
      }
    }
  }
}

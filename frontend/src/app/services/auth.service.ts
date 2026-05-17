import { Injectable, signal, computed, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap, catchError, throwError, map } from "rxjs";
import { User, LoginRequest, RegisterRequest, AuthResponse } from "../models/auth.model";
import { API_BASE_URL } from "./api.constants";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly baseUrl = `${API_BASE_URL}/auth`;

  private http = inject(HttpClient);
  private router = inject(Router);

  private _currentUser = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private logoutTimer: ReturnType<typeof setTimeout> | null = null;

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._currentUser()?.isAdmin ?? false);

  constructor() {
    this.loadStoredAuth();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(({ data }) => {
        const expiresInMs = this.getTokenExpirationTime(data.token) - Date.now();

        this._token.set(data.token);
        this._currentUser.set(data.user);

        this.setCookie("authToken", data.token, expiresInMs);
        this.setCookie("currentUser", JSON.stringify(data.user), expiresInMs);

        this.scheduleAutoLogout(data.token);
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  register(userData: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/register`, userData).pipe(
      tap(() => void this.router.navigate(["/login"])),
      catchError((err) => throwError(() => err)),
    );
  }

  logout(): void {
    this.clearAuthData();
    void this.router.navigate(["/login"]);
  }

  updateUser(userData: Partial<User>): Observable<User> {
    const userId = this._currentUser()?.id;
    const token = this._token();

    if (!userId || !token) {
      return throwError(() => new Error("User not found"));
    }

    return this.http
      .put<{ error: null; data: User }>(`${API_BASE_URL}/users/${userId}`, userData)
      .pipe(
        map((res) => res.data),
        tap((user) => {
          const merged = { ...this._currentUser()!, ...user };
          const expiresInMs = this.getTokenExpirationTime(token) - Date.now();

          this._currentUser.set(merged);
          this.setCookie("currentUser", JSON.stringify(merged), expiresInMs);
        }),
        catchError((err) => throwError(() => err)),
      );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    const payload = { currentPassword, newPassword };

    return this.http.post<void>(`${this.baseUrl}/change-password`, payload).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  private loadStoredAuth(): void {
    const token = this.getCookie("authToken");
    const user = this.getCookie("currentUser");

    if (!token || !user) {
      this.clearAuthData();
      return;
    }

    if (this.getTokenExpirationTime(token) <= Date.now()) {
      this.clearAuthData();
      return;
    }

    try {
      this._token.set(token);
      this._currentUser.set(JSON.parse(user));
      this.scheduleAutoLogout(token);
    } catch {
      this.clearAuthData();
    }
  }

  private clearAuthData(): void {
    this._token.set(null);
    this._currentUser.set(null);

    this.deleteCookie("authToken");
    this.deleteCookie("currentUser");

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  private scheduleAutoLogout(token: string): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    const timeUntilExpiration = this.getTokenExpirationTime(token) - Date.now();

    if (timeUntilExpiration > 0) {
      this.logoutTimer = setTimeout(() => {
        this.logout();
      }, timeUntilExpiration);
    } else {
      this.logout();
    }
  }

  private getTokenExpirationTime(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000;
    } catch {
      return Date.now();
    }
  }

  private setCookie(name: string, value: string, expiresInMs: number): void {
    const expires = new Date(Date.now() + expiresInMs);
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();

      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
  }
}

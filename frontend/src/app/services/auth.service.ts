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

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._currentUser()?.isAdmin ?? false);

  constructor() {
    this.loadStoredAuth();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(({ data }) => {
        this._token.set(data.token);
        this._currentUser.set(data.user);
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        void this.router.navigate(["/"]);
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
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.clear();
    void this.router.navigate(["/login"]);
  }

  updateUser(userData: Partial<User>): Observable<User> {
    const userId = this._currentUser()?.id;
    if (!userId) return throwError(() => new Error("User not found"));

    return this.http
      .put<{ error: null; data: User }>(`${API_BASE_URL}/users/${userId}`, userData)
      .pipe(
        map((res) => res.data),
        tap((user) => {
          const merged = { ...this._currentUser()!, ...user };
          this._currentUser.set(merged);
          localStorage.setItem("currentUser", JSON.stringify(merged));
        }),
        catchError((err) => throwError(() => err)),
      );
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("currentUser");

    if (!token) return;

    this._token.set(token);

    if (user) {
      try {
        this._currentUser.set(JSON.parse(user));
      } catch {
        this._currentUser.set(null);
      }
    }
  }
}

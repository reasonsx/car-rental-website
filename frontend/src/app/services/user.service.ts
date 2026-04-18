import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "../models/auth.model";
import { API_BASE_URL } from "./api.constants";

@Injectable({ providedIn: "root" })
export class UserService {
  private readonly baseUrl = `${API_BASE_URL}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<{ error: null; data: User[] }> {
    return this.http.get<{ error: null; data: User[] }>(this.baseUrl, {});
  }

  getUserById(id: string): Observable<{ error: null; data: User }> {
    return this.http.get<{ error: null; data: User }>(`${this.baseUrl}/${id}`, {});
  }

  updateUser(id: string, user: Partial<User>): Observable<{ error: null; data: User }> {
    return this.http.put<{ error: null; data: User }>(`${this.baseUrl}/${id}`, user, {});
  }

  deleteUser(id: string): Observable<{ error: null; data: string }> {
    return this.http.delete<{ error: null; data: string }>(`${this.baseUrl}/${id}`, {});
  }
}

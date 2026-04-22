import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { User } from "../models/user.model";
import { API_BASE_URL } from "./api.constants";

// API wrapper
interface ApiResponse<T> {
  error: string | null;
  data: T;
}

@Injectable({ providedIn: "root" })
export class UserService {
  private readonly baseUrl = `${API_BASE_URL}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(this.baseUrl).pipe(map((res) => res.data));
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/${id}`).pipe(map((res) => res.data));
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http
      .put<ApiResponse<User>>(`${this.baseUrl}/${id}`, user)
      .pipe(map((res) => res.data));
  }

  // deleteUser(id: string): Observable<string> {
  //   return this.http
  //     .delete<ApiResponse<string>>(`${this.baseUrl}/${id}`)
  //     .pipe(map((res) => res.data));
  // } // We cannot delete the user now, we soft delete by setting isDeleted to true
}

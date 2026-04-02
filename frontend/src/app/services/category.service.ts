import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { API_BASE_URL } from './api.constants';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly baseUrl = `${API_BASE_URL}/categories`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category);
  }

  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../../../services/category.service';
import { Category } from '../../../../models/category.model';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    TableModule
  ],
  templateUrl: './admin-categories.component.html'
})
export class AdminCategoriesComponent {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  // state
  categories = signal<Category[]>([]);
  selectedCategory = signal<Category | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // ✅ typed form (cleaner)
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['']
  });

  constructor() {
    this.loadCategories();
  }

  // ========================
  // DATA
  // ========================

  loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load categories');
        this.loading.set(false);
      }
    });
  }

  // ========================
  // EDIT
  // ========================

  editCategory(category: Category): void {
    this.selectedCategory.set(category);

    this.form.patchValue({
      name: category.name,
      description: category.description ?? ''
    });

    this.error.set(null);
    this.success.set(null);
  }

  cancelEdit(): void {
    this.selectedCategory.set(null);

    this.form.reset({
      name: '',
      description: ''
    });

    this.error.set(null);
    this.success.set(null);
  }

  // ========================
  // SAVE
  // ========================

  saveCategory(): void {
    if (this.form.invalid) return;

    const data = this.form.getRawValue();

    const request = this.selectedCategory()
      ? this.categoryService.updateCategory(this.selectedCategory()?._id ?? '', data)
      : this.categoryService.createCategory(data);

    request.subscribe({
      next: () => {
        this.success.set(
          this.selectedCategory() ? 'Category updated' : 'Category created'
        );

        this.cancelEdit();
        this.loadCategories();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to save category');
      }
    });
  }

  // ========================
  // DELETE
  // ========================

  deleteCategory(id: string): void {
    if (!confirm('Delete this category?')) return;

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.success.set('Category deleted');
        this.loadCategories();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to delete category');
      }
    });
  }
}

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../../services/category.service';
import { Category } from '../../../../models/category.model';
import {TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
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
  categories = signal<Category[]>([]);
  selectedCategory = signal<Category | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
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

  editCategory(category: Category): void {
    this.selectedCategory.set(category);
    this.form.setValue({
      name: category.name,
      description: category.description || ''
    });
    this.success.set(null);
    this.error.set(null);
  }

  saveCategory(): void {
    if (this.form.invalid) return;

    const data = this.form.value;
    const operation = this.selectedCategory() ?
      this.categoryService.updateCategory(this.selectedCategory()?._id ?? '', data) :
      this.categoryService.createCategory(data);

    operation.subscribe({
      next: () => {
        this.success.set(this.selectedCategory() ? 'Category updated' : 'Category created');
        this.cancelEdit();
        this.loadCategories();
      },
      error: (err) => this.error.set(err.error?.message || 'Failed to save category')
    });
  }

  deleteCategory(id: string): void {
    if (!confirm('Delete this category?')) return;
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.success.set('Category deleted');
        this.loadCategories();
      },
      error: (err) => this.error.set(err.error?.message || 'Failed to delete category')
    });
  }

  cancelEdit(): void {
    this.selectedCategory.set(null);
    this.form.reset();
    this.error.set(null);
    this.success.set(null);
  }
}

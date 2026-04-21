import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { CategoryService } from "../../../../services/category.service";
import { Category } from "../../../../models/category.model";

import { TableModule } from "primeng/table";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { TextareaModule } from "primeng/textarea";

@Component({
  selector: "app-admin-categories",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    TableModule,
  ],
  templateUrl: "./admin-categories.component.html",
})
export class AdminCategoriesComponent {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  categories = signal<Category[]>([]);
  selectedCategory = signal<Category | null>(null);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ["", Validators.required],
    description: [""],
  });

  constructor() {
    this.fetchCategories();
  }

  fetchCategories() {
    this.setLoading();

    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res);
        this.loading.set(false);
      },
      error: (err) => this.setError(err, "Failed to load categories"),
    });
  }

  edit(category: Category) {
    this.selectedCategory.set(category);

    this.form.patchValue({
      name: category.name,
      description: category.description ?? "",
    });

    this.clearMessages();
  }

  cancel() {
    this.selectedCategory.set(null);
    this.form.reset({ name: "", description: "" });
    this.clearMessages();
  }

  save() {
    if (this.form.invalid) return;

    const data = this.form.getRawValue();
    const current = this.selectedCategory();

    const request = current
      ? this.categoryService.updateCategory(current.id, data)
      : this.categoryService.createCategory(data);

    request.subscribe({
      next: () => {
        this.success.set(current ? "Category updated" : "Category created");
        this.cancel();
        this.fetchCategories();
      },
      error: (err) => this.setError(err, "Failed to save category"),
    });
  }

  remove(id: string) {
    if (!confirm("Delete this category?")) return;

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.success.set("Category deleted");
        this.fetchCategories();
      },
      error: (err) => this.setError(err, "Failed to delete category"),
    });
  }

  private setLoading() {
    this.loading.set(true);
    this.clearMessages();
  }

  private setError(err: any, fallback: string) {
    this.error.set(err?.error?.message || fallback);
    this.loading.set(false);
  }

  private clearMessages() {
    this.error.set(null);
    this.success.set(null);
  }
}

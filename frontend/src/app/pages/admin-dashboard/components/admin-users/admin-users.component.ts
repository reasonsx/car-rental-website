import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { UserService } from "../../../../services/user.service";
import { User } from "../../../../models/auth.model";

import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { InputTextModule } from "primeng/inputtext";

@Component({
  selector: "app-admin-users",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    CheckboxModule,
  ],
  templateUrl: "./admin-users.component.html",
})
export class AdminUsersComponent {
  users = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  private fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    name: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    isAdmin: false,
  });
  private userService = inject(UserService);

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || "Failed to load users");
        this.loading.set(false);
      },
    });
  }

  editUser(user: User): void {
    this.selectedUser.set(user);

    this.form.patchValue({
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    this.error.set(null);
    this.success.set(null);
  }

  saveUser(): void {
    if (this.form.invalid || !this.selectedUser()) return;

    const userId = this.selectedUser()?.id;

    this.userService.updateUser(userId!, this.form.getRawValue()).subscribe({
      next: () => {
        this.success.set("User updated successfully");
        this.cancelEdit();
        this.loadUsers();
      },
      error: (err) => {
        this.error.set(err.error?.message || "Failed to update user");
      },
    });
  }

  deleteUser(id: string): void {
    if (!confirm("Delete this user?")) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.success.set("User deleted successfully");
        this.loadUsers();
      },
      error: (err) => {
        this.error.set(err.error?.message || "Failed to delete user");
      },
    });
  }

  cancelEdit(): void {
    this.selectedUser.set(null);
    this.form.reset({
      name: "",
      email: "",
      isAdmin: false,
    });

    this.error.set(null);
    this.success.set(null);
  }
}

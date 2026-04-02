import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../models/auth.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent {
  users = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      isAdmin: [false]
    });

    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.userService.getAllUsers().subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load users');
        this.loading.set(false);
      }
    });
  }

  editUser(user: User): void {
    this.selectedUser.set(user);
    this.form.setValue({
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
    this.success.set(null);
    this.error.set(null);
  }

  saveUser(): void {
    if (this.form.invalid) return;

    const data = this.form.value;
    const userId = this.selectedUser()?.id;

    if (!userId) {
      this.error.set('No user selected');
      return;
    }

    this.userService.updateUser(userId, data).subscribe({
      next: () => {
        this.success.set('User updated successfully');
        this.cancelEdit();
        this.loadUsers();
      },
      error: (err) => this.error.set(err.error?.message || 'Failed to update user')
    });
  }

  deleteUser(id: string): void {
    if (!confirm('Delete this user?')) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.success.set('User deleted successfully');
        this.loadUsers();
      },
      error: (err) => this.error.set(err.error?.message || 'Failed to delete user')
    });
  }

  cancelEdit(): void {
    this.selectedUser.set(null);
    this.form.reset({ isAdmin: false });
    this.error.set(null);
    this.success.set(null);
  }
}

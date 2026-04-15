import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';
import {InputTextModule} from 'primeng/inputtext';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {PasswordModule} from 'primeng/password';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  currentUser = computed(() => this.authService.currentUser());
  isAdmin = computed(() => this.authService.isAdmin());
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    currentPassword: [''],
    newPassword: [''],
    confirmNewPassword: ['']
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email
      });
    }
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.profileForm.value;
    const updateData: Partial<User> = {
      name: formValue.name,
      email: formValue.email
    };

    // Only include password if user wants to change it
    if (formValue.newPassword) {
      // In a real app, you'd verify current password on backend
      updateData.password = formValue.newPassword;
    }

    this.authService.updateUser(updateData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set('Profile updated successfully!');
        // Clear password fields
        this.profileForm.patchValue({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      },
      error: (error) => {
        this.isLoading.set(false);
        this.error.set(error.error?.message || 'Failed to update profile');
      }
    });
  }

  goToAdminDashboard(): void {
    this.router.navigate(['/admin']);
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const newPassword = group.get('newPassword');
    const confirmNewPassword = group.get('confirmNewPassword');

    if (newPassword && confirmNewPassword && newPassword.value !== confirmNewPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  get profileFormControls() {
    return this.profileForm.controls;
  }
}

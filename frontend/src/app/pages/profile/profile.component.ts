import { Component, signal, computed, inject, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { BookingService } from "../../services/booking.service";
import { User } from "../../models/auth.model";
import { Booking } from "../../models/booking.model";
import { InputTextModule } from "primeng/inputtext";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { PasswordModule } from "primeng/password";
import { MessageModule } from "primeng/message";
import {
  emailValidators,
  nameValidators,
  optionalNewPasswordValidators,
} from "../../validators/auth.validators";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    MessageModule,
  ],
  templateUrl: "./profile.component.html",
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private bookingService = inject(BookingService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  currentUser = computed(() => this.authService.currentUser());
  isAdmin = computed(() => this.authService.isAdmin());

  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  bookings = signal<Booking[]>([]);
  bookingsLoading = signal(false);
  bookingsError = signal<string | null>(null);

  profileForm: FormGroup = this.fb.group(
    {
      name: ["", nameValidators],
      email: ["", emailValidators],
      currentPassword: [""],
      newPassword: ["", optionalNewPasswordValidators],
      confirmNewPassword: [""],
    },
    { validators: this.passwordMatchValidator },
  );

  constructor() {
    const user = this.currentUser();

    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
      });
    }

    // Load user bookings
    effect(() => {
      if (this.currentUser()) {
        this.loadBookings();
      }
    });
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.success.set(null);

    const formValue = this.profileForm.value;

    const updateData: Partial<User> = {
      name: formValue.name,
      email: formValue.email,
    };

    const doProfileUpdate = () => {
      return this.authService.updateUser(updateData);
    };

    const performPasswordChange = () => {
      if (!formValue.newPassword) return null;
      if (!formValue.currentPassword) {
        throw { error: { message: "Current password is required to change password" } };
      }
      if (!formValue.confirmNewPassword) {
        throw { error: { message: "Password confirmation is required" } };
      }

      return this.authService.changePassword(formValue.currentPassword, formValue.newPassword);
    };

    // Execute profile update first (if any fields present), then password change if requested
    const profileObs = doProfileUpdate();

    profileObs.subscribe({
      next: async () => {
        try {
          if (formValue.newPassword) {
            await new Promise((resolve, reject) => {
              const pwObs = performPasswordChange();
              if (!pwObs) return resolve(null);
              pwObs.subscribe({ next: () => resolve(null), error: (e) => reject(e) });
            });
          }

          this.isLoading.set(false);
          this.success.set("Profile updated successfully!");

          this.profileForm.patchValue({
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
          });
        } catch (err: any) {
          this.isLoading.set(false);
          this.error.set(this.getHttpErrorMessage(err, "Failed to change password"));
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.error.set(this.getHttpErrorMessage(err, "Failed to update profile"));
      },
    });
  }

  goToAdminDashboard() {
    this.router.navigate(["/admin"]);
  }

  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get("newPassword")?.value;
    const confirm = group.get("confirmNewPassword")?.value;

    if (!newPassword && !confirm) return null;
    if (newPassword && !confirm) return { passwordConfirmationRequired: true };

    return newPassword && confirm && newPassword !== confirm ? { passwordMismatch: true } : null;
  }

  get profileFormControls() {
    return this.profileForm.controls;
  }

  get nameErrors(): string[] {
    const control = this.profileForm.get("name");
    const errors: string[] = [];

    if (control?.hasError("required")) errors.push("Name is required");
    if (control?.hasError("minlength")) errors.push("Name must be at least 3 characters");
    if (control?.hasError("maxlength")) errors.push("Name must not exceed 100 characters");
    if (control?.hasError("htmlTag")) errors.push("Name cannot contain HTML tags");
    if (control?.hasError("controlCharacter")) errors.push("Name contains invalid characters");

    return errors;
  }

  get emailErrors(): string[] {
    const control = this.profileForm.get("email");
    const errors: string[] = [];

    if (control?.hasError("required")) errors.push("Email is required");
    if (control?.hasError("email")) errors.push("Enter a valid email address");
    if (control?.hasError("maxlength")) errors.push("Email must not exceed 254 characters");
    if (control?.hasError("htmlTag")) errors.push("Email cannot contain HTML tags");
    if (control?.hasError("controlCharacter")) errors.push("Email contains invalid characters");

    return errors;
  }

  get newPasswordErrors(): string[] {
    const control = this.profileForm.get("newPassword");
    const errors: string[] = [];

    if (control?.hasError("minlength")) errors.push("New password must be at least 8 characters");
    if (control?.hasError("maxlength")) errors.push("New password must not exceed 64 characters");
    if (control?.hasError("maxUtf8Bytes")) errors.push("New password is too long for secure storage");
    if (control?.hasError("htmlTag")) errors.push("New password cannot contain HTML tags");
    if (control?.hasError("controlCharacter")) {
      errors.push("New password contains invalid characters");
    }

    return errors;
  }

  private loadBookings() {
    this.bookingsLoading.set(true);
    this.bookingsError.set(null);

    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.bookingsLoading.set(false);
      },
      error: (err: any) => {
        this.bookingsLoading.set(false);
        this.bookingsError.set(this.getHttpErrorMessage(err, "Failed to load bookings"));
      },
    });
  }

  private getHttpErrorMessage(err: any, fallback: string): string {
    return err?.error?.message ?? err?.error?.error ?? fallback;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}

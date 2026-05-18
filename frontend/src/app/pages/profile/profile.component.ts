import { CommonModule } from "@angular/common";
import { Component, computed, effect, inject, signal } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { PasswordModule } from "primeng/password";
import { User } from "../../models/auth.model";
import { Booking } from "../../models/booking.model";
import { AuthService } from "../../services/auth.service";
import { BookingService } from "../../services/booking.service";
import { emailValidators, nameValidators, newPasswordValidators } from "../../validators/auth.validators";

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
  private bookingsLoadedForUserId: string | null = null;
  private profileFormUserId: string | null = null;

  currentUser = computed(() => this.authService.currentUser());
  isAdmin = computed(() => this.authService.isAdmin());

  profileLoading = signal(false);
  profileError = signal<string | null>(null);
  profileSuccess = signal<string | null>(null);

  passwordLoading = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);

  bookings = signal<Booking[]>([]);
  bookingsLoading = signal(false);
  bookingsError = signal<string | null>(null);

  profileForm: FormGroup = this.fb.group({
    name: ["", nameValidators],
    email: ["", emailValidators],
  });

  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ["", Validators.required],
      newPassword: ["", newPasswordValidators],
      confirmNewPassword: ["", Validators.required],
    },
    { validators: this.passwordMatchValidator },
  );

  constructor() {
    effect(() => {
      const user = this.currentUser();

      if (!user) {
        this.bookingsLoadedForUserId = null;
        this.profileFormUserId = null;
        this.bookings.set([]);
        this.profileForm.reset({ name: "", email: "" }, { emitEvent: false });
        return;
      }

      if (this.profileFormUserId !== user.id && !this.profileForm.dirty) {
        this.profileForm.patchValue(
          {
            name: user.name,
            email: user.email,
          },
          { emitEvent: false },
        );
        this.profileForm.markAsPristine();
        this.profileFormUserId = user.id;
      }

      if (this.bookingsLoadedForUserId !== user.id) {
        this.bookingsLoadedForUserId = user.id;
        this.loadBookings();
      }
    });
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const currentUser = this.currentUser();
    if (!currentUser) return;

    const formValue = this.profileForm.getRawValue();
    const updateData: Partial<User> = {
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase(),
    };

    if (updateData.name === currentUser.name && updateData.email === currentUser.email) {
      this.profileSuccess.set("No profile changes to save.");
      this.profileError.set(null);
      return;
    }

    this.profileLoading.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(null);

    this.authService.updateUser(updateData).subscribe({
      next: (user) => {
        this.profileForm.patchValue(
          {
            name: user.name,
            email: user.email,
          },
          { emitEvent: false },
        );
        this.profileForm.markAsPristine();
        this.profileLoading.set(false);
        this.profileSuccess.set("Profile updated successfully.");
      },
      error: (err: any) => {
        this.profileLoading.set(false);
        this.profileError.set(this.getHttpErrorMessage(err, "Failed to update profile"));
      },
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const formValue = this.passwordForm.getRawValue();

    this.passwordLoading.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    this.authService.changePassword(formValue.currentPassword, formValue.newPassword).subscribe({
      next: () => {
        this.passwordForm.reset(
          {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
          },
          { emitEvent: false },
        );
        this.passwordLoading.set(false);
        this.passwordSuccess.set("Password changed successfully.");
      },
      error: (err: any) => {
        this.passwordLoading.set(false);
        this.passwordError.set(this.getHttpErrorMessage(err, "Failed to change password"));
      },
    });
  }

  goToAdminDashboard(): void {
    void this.router.navigate(["/admin"]);
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get("newPassword")?.value;
    const confirm = group.get("confirmNewPassword")?.value;

    if (!newPassword && !confirm) return null;
    if (newPassword && !confirm) return { passwordConfirmationRequired: true };

    return newPassword && confirm && newPassword !== confirm ? { passwordMismatch: true } : null;
  }

  get profileFormControls() {
    return this.profileForm.controls;
  }

  get passwordFormControls() {
    return this.passwordForm.controls;
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

  get currentPasswordErrors(): string[] {
    return this.passwordForm.get("currentPassword")?.hasError("required")
      ? ["Current password is required"]
      : [];
  }

  get newPasswordErrors(): string[] {
    const control = this.passwordForm.get("newPassword");
    const errors: string[] = [];

    if (control?.hasError("required")) errors.push("New password is required");
    if (control?.hasError("minlength")) errors.push("New password must be at least 8 characters");
    if (control?.hasError("maxlength")) errors.push("New password must not exceed 64 characters");
    if (control?.hasError("maxUtf8Bytes")) errors.push("New password is too long for secure storage");
    if (control?.hasError("htmlTag")) errors.push("New password cannot contain HTML tags");
    if (control?.hasError("controlCharacter")) {
      errors.push("New password contains invalid characters");
    }

    return errors;
  }

  get confirmNewPasswordErrors(): string[] {
    const control = this.passwordForm.get("confirmNewPassword");
    const errors: string[] = [];

    if (control?.hasError("required") || this.passwordForm.hasError("passwordConfirmationRequired")) {
      errors.push("Password confirmation is required");
    }
    if (this.passwordForm.hasError("passwordMismatch")) errors.push("Passwords do not match");

    return errors;
  }

  private loadBookings(): void {
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

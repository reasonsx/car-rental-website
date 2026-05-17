import { Component, signal, computed, inject, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { BookingService } from "../../services/booking.service";
import { User } from "../../models/auth.model";
import { Booking } from "../../models/booking.model";
import { InputTextModule } from "primeng/inputtext";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { PasswordModule } from "primeng/password";

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
      name: ["", [Validators.required, Validators.minLength(3)]],
      email: ["", [Validators.required, Validators.email]],
      currentPassword: [""],
      newPassword: [""],
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
    if (this.profileForm.invalid) return;

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
          this.error.set(err?.error?.message || "Failed to change password");
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.error.set(err?.error?.message || "Failed to update profile");
      },
    });
  }

  goToAdminDashboard() {
    this.router.navigate(["/admin"]);
  }

  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get("newPassword")?.value;
    const confirm = group.get("confirmNewPassword")?.value;

    return newPassword && confirm && newPassword !== confirm ? { passwordMismatch: true } : null;
  }

  get profileFormControls() {
    return this.profileForm.controls;
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
        this.bookingsError.set(err?.error?.message || "Failed to load bookings");
      },
    });
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

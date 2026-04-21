import { Component, signal, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { User } from "../../models/auth.model";
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
  private fb = inject(FormBuilder);
  private router = inject(Router);

  currentUser = computed(() => this.authService.currentUser());
  isAdmin = computed(() => this.authService.isAdmin());

  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

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

    if (formValue.newPassword) {
      updateData.password = formValue.newPassword;
    }

    this.authService.updateUser(updateData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set("Profile updated successfully!");

        this.profileForm.patchValue({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || "Failed to update profile");
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
}

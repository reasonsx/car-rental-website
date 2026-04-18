import { Component, signal, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";

import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { ButtonModule } from "primeng/button";

import { AuthService } from "../../services/auth.service";
import { LoginRequest, RegisterRequest } from "../../models/auth.model";
import { CardModule } from "primeng/card";

@Component({
  selector: "app-auth",
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
  ],
  templateUrl: "./auth.component.html",
})
export class AuthComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isLogin = signal(true);
  loading = signal(false);
  error = signal<string>("");

  form = new FormGroup(
    {
      name: new FormControl("", {
        nonNullable: true,
        validators: [Validators.minLength(3)],
      }),
      email: new FormControl("", {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl("", {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/), // at least 1 letter + number
        ],
      }),
      confirmPassword: new FormControl("", {
        nonNullable: true,
      }),
    },
    { validators: this.passwordMatchValidator() },
  );

  // ✅ expose controls (clean template, no .controls access issues)
  email = this.form.get("email");
  password = this.form.get("password");
  confirmPassword = this.form.get("confirmPassword");

  toggleMode() {
    this.isLogin.update((v) => !v);
    this.error.set("");
    this.form.reset();

    if (this.isLogin()) {
      // LOGIN MODE
      this.form.get("name")?.clearValidators();
      this.form.get("confirmPassword")?.clearValidators();
    } else {
      // REGISTER MODE
      this.form.get("name")?.setValidators([Validators.required, Validators.minLength(3)]);

      this.form.get("confirmPassword")?.setValidators([Validators.required]);
    }

    this.form.get("name")?.updateValueAndValidity();
    this.form.get("confirmPassword")?.updateValueAndValidity();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set("");

    const v = this.form.getRawValue();

    if (this.isLogin()) {
      const payload: LoginRequest = {
        email: v.email,
        password: v.password,
      };

      this.auth.login(payload).subscribe({
        next: () => this.loading.set(false),
        error: (err) => {
          this.error.set(err?.error?.message ?? "Login failed");
          this.loading.set(false);
        },
      });
    } else {
      const payload: RegisterRequest = {
        name: v.name,
        email: v.email,
        password: v.password,
      };

      this.auth.register(payload).subscribe({
        next: () => {
          this.toggleMode();
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? "Registration failed");
          this.loading.set(false);
        },
      });
    }
  }

  private passwordMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get("password")?.value;
      const confirm = group.get("confirmPassword")?.value;

      if (!confirm) return null;

      return password === confirm ? null : { passwordMismatch: true };
    };
  }
}

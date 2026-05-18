import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { PasswordModule } from "primeng/password";

import { LoginRequest, RegisterRequest } from "../../models/auth.model";
import { AuthService } from "../../services/auth.service";
import {
  emailValidators,
  loginPasswordValidators,
  nameValidators,
  newPasswordValidators,
} from "../../validators/auth.validators";

@Component({
  selector: "app-auth",
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    CardModule,
  ],
  templateUrl: "./auth.component.html",
})
export class AuthComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLogin = signal(true);
  loading = signal(false);
  error = signal<string>("");

  form = new FormGroup(
    {
      name: new FormControl("", {
        nonNullable: true,
        validators: [],
      }),
      email: new FormControl("", {
        nonNullable: true,
        validators: emailValidators,
      }),
      password: new FormControl("", {
        nonNullable: true,
        validators: loginPasswordValidators,
      }),
      confirmPassword: new FormControl("", {
        nonNullable: true,
      }),
    },
    { validators: this.passwordMatchValidator() },
  );

  name = this.form.get("name");
  email = this.form.get("email");
  password = this.form.get("password");
  confirmPassword = this.form.get("confirmPassword");

  get nameErrors(): string[] {
    const errors: string[] = [];

    if (this.name?.hasError("required")) errors.push("Name is required");
    if (this.name?.hasError("minlength")) errors.push("Name must be at least 3 characters");
    if (this.name?.hasError("maxlength")) errors.push("Name must not exceed 100 characters");
    if (this.name?.hasError("htmlTag")) errors.push("Name cannot contain HTML tags");
    if (this.name?.hasError("controlCharacter")) errors.push("Name contains invalid characters");

    return errors;
  }

  get emailErrors(): string[] {
    const errors: string[] = [];

    if (this.email?.hasError("required")) errors.push("Email is required");
    if (this.email?.hasError("email")) errors.push("Enter a valid email address");
    if (this.email?.hasError("maxlength")) errors.push("Email must not exceed 254 characters");
    if (this.email?.hasError("htmlTag")) errors.push("Email cannot contain HTML tags");
    if (this.email?.hasError("controlCharacter")) errors.push("Email contains invalid characters");

    return errors;
  }

  get passwordErrors(): string[] {
    const errors: string[] = [];

    if (this.password?.hasError("required")) errors.push("Password is required");
    if (this.password?.hasError("minlength")) errors.push("Password must be at least 8 characters");
    if (this.password?.hasError("maxlength")) errors.push("Password must not exceed 64 characters");
    if (this.password?.hasError("maxUtf8Bytes")) {
      errors.push("Password is too long for secure storage");
    }
    if (this.password?.hasError("htmlTag")) errors.push("Password cannot contain HTML tags");
    if (this.password?.hasError("controlCharacter")) {
      errors.push("Password contains invalid characters");
    }

    return errors;
  }

  get confirmPasswordErrors(): string[] {
    const errors: string[] = [];

    if (this.confirmPassword?.hasError("required")) {
      errors.push("Password confirmation is required");
    }
    if (this.form.hasError("passwordMismatch")) errors.push("Passwords do not match");

    return errors;
  }

  toggleMode(): void {
    this.isLogin.update((value) => !value);
    this.error.set("");
    this.form.reset();

    if (this.isLogin()) {
      this.name?.clearValidators();
      this.confirmPassword?.clearValidators();
      this.password?.setValidators(loginPasswordValidators);
    } else {
      this.name?.setValidators(nameValidators);
      this.confirmPassword?.setValidators([Validators.required]);
      this.password?.setValidators(newPasswordValidators);
    }

    this.name?.updateValueAndValidity();
    this.password?.updateValueAndValidity();
    this.confirmPassword?.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set("");

    const value = this.form.getRawValue();

    if (this.isLogin()) {
      const payload: LoginRequest = {
        email: value.email.trim().toLowerCase(),
        password: value.password,
      };

      this.auth.login(payload).subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl") || "/profile";
          void this.router.navigateByUrl(returnUrl);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(this.getHttpErrorMessage(err, "Login failed"));
          this.loading.set(false);
        },
      });
      return;
    }

    const payload: RegisterRequest = {
      name: value.name.trim(),
      email: value.email.trim().toLowerCase(),
      password: value.password,
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.toggleMode();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.getHttpErrorMessage(err, "Registration failed"));
        this.loading.set(false);
      },
    });
  }

  private passwordMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get("password")?.value;
      const confirm = group.get("confirmPassword")?.value;

      if (!confirm) return null;

      return password === confirm ? null : { passwordMismatch: true };
    };
  }

  private getHttpErrorMessage(err: any, fallback: string): string {
    return err?.error?.message ?? err?.error?.error ?? fallback;
  }
}

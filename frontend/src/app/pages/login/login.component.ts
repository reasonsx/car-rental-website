import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, RegisterRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  protected authService = inject(AuthService);

  isLoginMode = signal(true);
  isLoading = signal(false);
  error = signal<string | null>(null);

  loginForm = new FormGroup({
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
    password: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.minLength(6)]})
  });

  registerForm = new FormGroup(
    {
      name: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.minLength(3)]}),
      email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
      password: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.minLength(6)]}),
      confirmPassword: new FormControl('', {nonNullable: true, validators: [Validators.required]})
    },
    { validators: this.passwordMatchValidator() }
  );

  toggleMode() {
    this.isLoginMode.update(v => !v);
    this.error.set(null);
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const payload: LoginRequest = this.loginForm.getRawValue();

    this.authService.login(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err?.error?.message ?? 'Login failed');
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const { name, email, password } = this.registerForm.getRawValue();
    const payload: RegisterRequest = { name, email, password };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err?.error?.message ?? 'Registration failed');
      }
    });
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as FormGroup;
      const password = group.get('password')?.value;
      const confirm = group.get('confirmPassword')?.value;

      return password === confirm ? null : { passwordMismatch: true };
    };
  }
}

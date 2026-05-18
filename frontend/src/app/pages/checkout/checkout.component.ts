import { Component, computed, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { InputTextModule } from "primeng/inputtext";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";

import { BookingFlowService } from "../../services/booking-flow";
import { UserInfo } from "../../models/booking.model";

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function adultValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const birthDate = new Date(control.value);
    const today = new Date();

    // ❌ invalid date check
    if (isNaN(birthDate.getTime())) {
      return { invalidDate: true };
    }

    // ❌ block unrealistic old dates
    const minAllowedDate = new Date("1900-01-01");
    if (birthDate < minAllowedDate) {
      return { tooOld: true };
    }

    // ❌ block future dates
    if (birthDate > today) {
      return { futureDate: true };
    }

    // age calculation
    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff =
      today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= minAge
      ? null
      : { underage: true };
  };
}

export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const date = new Date(control.value);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return date > today ? null : { expired: true };
  };
}

@Component({
  selector: "app-checkout",
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    InputTextModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./checkout.html",
})
export class CheckoutComponent implements OnInit {
  router = inject(Router);

  private bookingFlowService = inject(BookingFlowService);
  private fb = inject(FormBuilder);

  bookingData = computed(() =>
    this.bookingFlowService.getBookingData(),
  );

  today = new Date();

  maxDateOfBirth: Date = new Date();

  userInfoForm!: FormGroup;

  constructor() {
    this.maxDateOfBirth.setFullYear(
      this.today.getFullYear() - 18,
    );
  }

  ngOnInit() {
    this.userInfoForm = this.fb.group({
      firstName: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],

      lastName: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],

      phone: [
        "",
        [
          Validators.required,
          Validators.pattern(/^[0-9+\-\s]{6,20}$/),
        ],
      ],

      dateOfBirth: [
        null,
        [Validators.required, adultValidator(18)],
      ],


      driversLicenseNumber: [
        "",
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(30),
        ],
      ],

      driversLicenseExpiry: [
        null,
        [Validators.required, futureDateValidator()],
      ],

      address: this.fb.group({
        street: [
          "",
          [
            Validators.required,
            Validators.maxLength(100),
          ],
        ],

        city: [
          "",
          [
            Validators.required,
            Validators.maxLength(50),
          ],
        ],

        postalCode: [
          "",
          [
            Validators.required,
            Validators.maxLength(20),
          ],
        ],

        country: [
          "",
          [
            Validators.required,
            Validators.maxLength(50),
          ],
        ],
      }),
    });
  }

  proceedToPayment() {
    this.userInfoForm.markAllAsTouched();

    if (this.userInfoForm.invalid) {
      return;
    }

    const formValue = this.userInfoForm.getRawValue();

    const userInfo: UserInfo = {
      firstName: formValue.firstName.trim(),

      lastName: formValue.lastName.trim(),

      phone: formValue.phone.trim(),

      driversLicenseNumber:
        formValue.driversLicenseNumber.trim(),

      address: {
        street: formValue.address.street.trim(),

        city: formValue.address.city.trim(),

        postalCode:
          formValue.address.postalCode.trim(),

        country: formValue.address.country.trim(),
      },

      dateOfBirth: formValue.dateOfBirth
        ? new Date(formValue.dateOfBirth)
            .toISOString()
            .split("T")[0]
        : "",

      driversLicenseExpiry:
        formValue.driversLicenseExpiry
          ? new Date(formValue.driversLicenseExpiry)
              .toISOString()
              .split("T")[0]
          : "",
    };

    this.bookingFlowService.updateBookingData({
      userInfo,
    });

    this.router.navigate(["/payment"]);
  }

  goBack() {
    this.router.navigate([
      "/car",
      this.bookingData()?.carId,
    ]);
  }
}
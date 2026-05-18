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
        [Validators.required],
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
        [Validators.required],
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
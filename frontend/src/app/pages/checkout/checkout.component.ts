import { Component, computed, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { InputTextModule } from "primeng/inputtext";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
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

  bookingData = computed(() => this.bookingFlowService.getBookingData());

  today = new Date();
  maxDateOfBirth: Date = new Date();

  userInfoForm!: FormGroup;

  constructor() {
    this.maxDateOfBirth.setFullYear(this.today.getFullYear() - 18);
  }

  ngOnInit() {
    this.userInfoForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      dateOfBirth: [null, [Validators.required]],
      driversLicenseNumber: ['', [Validators.required]],
      driversLicenseExpiry: [null, [Validators.required]],
      address: this.fb.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        postalCode: ['', [Validators.required]],
        country: ['', [Validators.required]],
      }),
    });
  }

  proceedToPayment() {
    if (this.userInfoForm.valid) {
      const formValue = this.userInfoForm.value;
      const userInfo: UserInfo = {
        ...formValue,
        dateOfBirth: formValue.dateOfBirth ? new Date(formValue.dateOfBirth).toISOString().split('T')[0] : '',
        driversLicenseExpiry: formValue.driversLicenseExpiry ? new Date(formValue.driversLicenseExpiry).toISOString().split('T')[0] : '',
      };
      this.bookingFlowService.updateBookingData({ userInfo });
      this.router.navigate(['/payment']);
    } else {
      // Mark all fields as touched to show validation errors
      this.userInfoForm.markAllAsTouched();
    }
  }

  goBack() {
    this.router.navigate(['/car', this.bookingData()?.carId]);
  }
}

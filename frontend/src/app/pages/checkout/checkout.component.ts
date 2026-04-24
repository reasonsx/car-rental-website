import { Component, computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { BookingFlowService } from "../../services/booking-flow";

@Component({
  selector: "app-checkout",
  imports: [CommonModule, CardModule, ButtonModule, DividerModule],
  templateUrl: "./checkout.html",
  styleUrl: "./checkout.scss",
})
export class CheckoutComponent {
  router = inject(Router);
  private bookingFlowService = inject(BookingFlowService);

  bookingData = computed(() => this.bookingFlowService.getBookingData());

  proceedToPayment() {
    this.router.navigate(['/payment']);
  }

  goBack() {
    this.router.navigate(['/car', this.bookingData()?.carId]);
  }
}

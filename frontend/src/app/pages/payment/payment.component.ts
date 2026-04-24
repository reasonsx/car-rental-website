import { Component, inject, ViewChild, ElementRef, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { BookingFlowService } from "../../services/booking-flow";
import { BookingService } from "../../services/booking.service";
import { StripeService } from "ngx-stripe";
import { StripeElementsOptions, StripeCardElementOptions } from "@stripe/stripe-js";

@Component({
  selector: "app-payment",
  imports: [CommonModule, CardModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: "./payment.html",
  styleUrl: "./payment.scss",
})
export class PaymentComponent implements OnInit {
  private router = inject(Router);
  private bookingFlowService = inject(BookingFlowService);
  private bookingService = inject(BookingService);
  private stripeService = inject(StripeService);

  @ViewChild('cardElement', { static: false }) cardElement!: ElementRef;

  bookingData = this.bookingFlowService.getBookingData();
  paymentProcessing = false;
  error: string | null = null;

  elementsOptions: StripeElementsOptions = {
    locale: 'en',
  };

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        fontWeight: '400',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
    },
  };

  private elements: any;
  private card: any;

  ngOnInit() {
    if (!this.bookingData) {
      this.router.navigate(['/']);
      return;
    }

    // Create the pending booking
    this.createBooking();
  }

  private createBooking() {
    if (!this.bookingData) return;

    this.bookingService
      .createBooking({
        carId: this.bookingData.carId,
        startDate: this.bookingData.startDate,
        endDate: this.bookingData.endDate,
      })
      .subscribe({
        next: (response) => {
          this.bookingFlowService.updateBookingData({
            bookingId: response.bookingId,
            clientSecret: response.clientSecret,
          });
          this.initializeStripeElements(response.clientSecret);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to create booking';
        },
      });
  }

  private initializeStripeElements(clientSecret: string) {
    this.elementsOptions.clientSecret = clientSecret;
    this.stripeService.elements(this.elementsOptions).subscribe(elements => {
      this.elements = elements;
      this.card = elements.create('card', this.cardOptions);
      this.card.mount(this.cardElement.nativeElement);
    });
  }

  pay() {
    if (!this.elements || !this.bookingFlowService.getBookingData()?.bookingId) return;

    this.paymentProcessing = true;
    this.error = null;

    this.stripeService.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    }).subscribe(result => {
      if (result.error) {
        this.error = result.error.message || 'Payment failed';
        this.paymentProcessing = false;
      } else {
        // Payment succeeded, confirm booking
        const bookingId = this.bookingFlowService.getBookingData()?.bookingId;
        if (bookingId) {
          this.bookingService.confirmBooking(bookingId).subscribe({
            next: () => {
              this.bookingFlowService.clearBookingData();
              this.router.navigate(['/confirmation']);
            },
            error: (err) => {
              this.error = 'Booking confirmation failed';
              this.paymentProcessing = false;
            },
          });
        }
      }
    });
  }

  goBack() {
    // Cancel the pending booking if it exists
    const bookingId = this.bookingFlowService.getBookingData()?.bookingId;
    if (bookingId) {
      this.bookingService.deleteBooking(bookingId).subscribe();
    }
    this.router.navigate(['/checkout']);
  }
}

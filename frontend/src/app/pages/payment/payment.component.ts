import { Component, inject, ViewChild, ElementRef, OnInit, AfterViewInit } from "@angular/core";
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
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: "./payment.html",
})
export class PaymentComponent implements OnInit, AfterViewInit {
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
  private elementsReady = false;

  ngOnInit() {
    if (!this.bookingData) {
      this.router.navigate(['/']);
      return;
    }

    // Create the pending booking
    this.createBooking();
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit called, cardElement:', this.cardElement);
    // Check if we already have booking data with clientSecret (from a previous navigation)
    const currentData = this.bookingFlowService.getBookingData();
    console.log('Current booking data in ngAfterViewInit:', currentData);
    if (currentData?.clientSecret && !this.elementsReady) {
      console.log('Initializing Stripe elements from existing data');
      this.initializeStripeElements(currentData.clientSecret);
    }
  }

  private createBooking() {
    if (!this.bookingData) return;

    console.log('Creating booking with data:', this.bookingData);
    this.bookingService
      .createBooking({
        carId: this.bookingData.carId,
        startDate: this.bookingData.startDate,
        endDate: this.bookingData.endDate,
        userInfo: this.bookingData.userInfo,
      })
      .subscribe({
        next: (response) => {
          console.log('Booking created successfully:', response);
          this.bookingFlowService.updateBookingData({
            bookingId: response.bookingId,
            clientSecret: response.clientSecret,
          });
          console.log('Updated booking data with clientSecret');
          // Now initialize Stripe elements since we have the clientSecret
          this.initializeStripeElements(response.clientSecret);
        },
        error: (err) => {
          console.error('Booking creation failed:', err);
          this.error = err.error?.message || 'Failed to create booking';
        },
      });
  }

  private initializeStripeElements(clientSecret: string) {
    if (!this.cardElement) {
      console.error('Card element not available');
      this.error = 'Payment form not ready. Please refresh the page.';
      return;
    }

    console.log('Initializing Stripe elements with clientSecret:', clientSecret);
    // For confirmCardPayment, we don't need clientSecret in elements options
    this.stripeService.elements(this.elementsOptions).subscribe(elements => {
      console.log('Stripe elements created:', elements);
      this.elements = elements;
      // Check if card element already exists
      if (this.card) {
        console.log('Card element already exists, unmounting first');
        this.card.unmount();
      }
      this.card = elements.create('card', this.cardOptions);
      console.log('Card element created:', this.card);
      console.log('Mounting to element:', this.cardElement.nativeElement);
      this.card.mount(this.cardElement.nativeElement);
      console.log('Card element mounted successfully');
      this.elementsReady = true;
      console.log('Elements ready for payment');
    });
  }

  pay() {
    console.log('Pay method called');
    console.log('Elements ready:', this.elementsReady);
    console.log('Elements object:', this.elements);
    console.log('Card object:', this.card);
    console.log('Card element ref:', this.cardElement);
    console.log('Booking data:', this.bookingFlowService.getBookingData());

    if (!this.elementsReady || !this.elements || !this.card || !this.bookingFlowService.getBookingData()?.bookingId) {
      this.error = 'Payment system not ready. Please try again.';
      console.error('Payment not ready:', {
        elementsReady: this.elementsReady,
        elements: !!this.elements,
        card: !!this.card,
        bookingId: this.bookingFlowService.getBookingData()?.bookingId
      });
      return;
    }

    this.paymentProcessing = true;
    this.error = null;

    const clientSecret = this.bookingFlowService.getBookingData()?.clientSecret;
    if (!clientSecret) {
      this.error = 'Payment session expired. Please start over.';
      this.paymentProcessing = false;
      return;
    }

    console.log('Confirming payment with clientSecret:', clientSecret);
    this.stripeService.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.card,
      },
    }).subscribe(result => {
      console.log('Payment confirmation result:', result);
      if (result.error) {
        console.error('Payment error:', result.error);
        this.error = result.error.message || 'Payment failed';
        this.paymentProcessing = false;
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded, confirming booking');
        // Payment succeeded, confirm booking
        const bookingId = this.bookingFlowService.getBookingData()?.bookingId;
        if (bookingId) {
          this.bookingService.confirmBooking(bookingId).subscribe({
            next: () => {
              console.log('Booking confirmed successfully');
              this.bookingFlowService.clearBookingData();
              this.router.navigate(['/confirmation']);
            },
            error: (err) => {
              console.error('Booking confirmation failed:', err);
              this.error = 'Booking confirmation failed';
              this.paymentProcessing = false;
            },
          });
        }
      } else {
        console.warn('Payment result unclear:', result);
        this.error = 'Payment processing incomplete';
        this.paymentProcessing = false;
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

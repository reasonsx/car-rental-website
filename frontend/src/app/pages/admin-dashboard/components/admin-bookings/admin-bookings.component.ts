import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BookingService } from "../../../../services/booking.service";
import { Booking } from "../../../../models/booking.model";

import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { SelectModule } from "primeng/select";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-admin-bookings",
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, SelectModule, FormsModule, RouterLink],
  templateUrl: "./admin-bookings.component.html",
})
export class AdminBookingsComponent {
  private bookingService = inject(BookingService);
  statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Cancelled", value: "cancelled" },
  ];
  bookings = signal<Booking[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading.set(true);

    this.bookingService.getBookings().subscribe({
      next: (data) => {
        this.bookings.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Failed to load bookings");
        this.loading.set(false);
      },
    });
  }

  updateStatus(booking: Booking, status: Booking["status"]) {
    if (booking.status === status) return;

    this.bookingService.updateBooking(booking._id, { status }).subscribe(() => {
      booking.status = status; // instant UI update
    });
  }

  delete(id: string) {
    if (!confirm("Delete booking?")) return;

    this.bookingService.deleteBooking(id).subscribe(() => this.loadBookings());
  }
}

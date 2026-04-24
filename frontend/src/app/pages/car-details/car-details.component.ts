import { Component, computed, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { CarService } from "../../services/car.service";
import { BookingService } from "../../services/booking.service";
import { Car } from "../../models/car.model";
import { Booking } from "../../models/booking.model";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ImageModule } from "primeng/image";
import { DividerModule } from "primeng/divider";
import { BookingFlowService } from "../../services/booking-flow";

@Component({
  selector: "app-car-details",
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    ImageModule,
    DividerModule,
  ],
  templateUrl: "./car-details.component.html",
})
export class CarDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carService = inject(CarService);
  private bookingService = inject(BookingService);
  private bookingFlowService = inject(BookingFlowService);

  car = signal<Car | null>(null);
  bookings = signal<Booking[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  monthOffset = signal(0);

  selectedRange = signal<[Date, Date] | null>(null);

  constructor() {
    this.loadData();
  }

  private normalize(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  private today(): number {
    return this.normalize(new Date());
  }

  isPast(d: Date): boolean {
    return this.normalize(d) < this.today();
  }

  selectDate(date: Date) {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (this.normalize(normalized) < this.today()) return;

    const current = this.selectedRange();

    if (!current) {
      this.selectedRange.set([normalized, normalized]);
      return;
    }

    const [start, end] = current;

    if (this.normalize(start) !== this.normalize(end)) {
      this.selectedRange.set([normalized, normalized]);
      return;
    }

    const newStart = this.normalize(normalized) < this.normalize(start) ? normalized : start;
    const newEnd = this.normalize(normalized) < this.normalize(start) ? start : normalized;

    if (!this.isRangeValid(newStart, newEnd)) return;

    this.selectedRange.set([newStart, newEnd]);
  }

  isSelected(d: Date): boolean {
    const range = this.selectedRange();
    if (!range) return false;

    const [start, end] = range;
    const t = this.normalize(d);

    return t >= this.normalize(start) && t <= this.normalize(end);
  }

  isRangeValid(start: Date, end: Date): boolean {
    return !this.bookedRanges().some(
      (r) =>
        this.normalize(start) <= this.normalize(r.endDate) &&
        this.normalize(end) >= this.normalize(r.startDate),
    );
  }

  totalPrice = computed(() => {
    const range = this.selectedRange();
    const car = this.car();

    if (!range || !car) return 0;

    const [start, end] = range;
    const days = (this.normalize(end) - this.normalize(start)) / (1000 * 60 * 60 * 24);

    return days > 0 ? days * car.pricePerDay : 0;
  });

  get carId(): string {
    return this.route.snapshot.paramMap.get("id") ?? "";
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    this.carService.getCarById(this.carId).subscribe({
      next: (car) => this.car.set(car),
      error: (err) => {
        this.error.set(err.error?.message || "Unable to load car details");
      },
    });

    this.bookingService.getBookingsForCar(this.carId).subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || "Unable to load bookings");
        this.loading.set(false);
      },
    });
  }

  bookedRanges = computed(() =>
    this.bookings().map((b) => ({
      startDate: new Date(b.startDate),
      endDate: new Date(b.endDate),
    })),
  );

  monthName = computed(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + this.monthOffset());

    return d.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  });

  days = computed(() => {
    const base = new Date();
    base.setMonth(base.getMonth() + this.monthOffset());
    base.setDate(1);

    const firstDay = base.getDay();
    const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

    const cells: { date: Date | null; booked: boolean }[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ date: null, booked: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(base.getFullYear(), base.getMonth(), day);

      cells.push({
        date,
        booked: this.isDateBooked(date),
      });
    }

    return cells;
  });

  isDateBooked(d: Date): boolean {
    const t = this.normalize(d);
    return this.bookedRanges().some(
      (r) => t >= this.normalize(r.startDate) && t <= this.normalize(r.endDate),
    );
  }

  prevMonth() {
    this.monthOffset.update((v) => v - 1);
  }

  nextMonth() {
    this.monthOffset.update((v) => v + 1);
  }

  bookCar() {
    const range = this.selectedRange();
    if (!range || !this.car()) return;

    const [start, end] = range;
    const car = this.car()!;

    // Set booking data in service
    this.bookingFlowService.setBookingData({
      carId: this.carId,
      startDate: start,
      endDate: end,
      car: car,
      totalPrice: this.totalPrice(),
    });

    // Navigate to checkout
    this.router.navigate(['/checkout']);
  }
}

import { Component, computed, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { CarService } from "../../services/car.service";
import { BookingService } from "../../services/booking.service";
import { Car } from "../../models/car.model";
import { Booking } from "../../models/booking.model";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ImageModule } from "primeng/image";
import { DividerModule } from "primeng/divider";

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
  private carService = inject(CarService);
  private bookingService = inject(BookingService);

  // state
  car = signal<Car | null>(null);
  bookings = signal<Booking[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  monthOffset = signal(0);

  // selection
  selectedRange = signal<[Date, Date] | null>(null);

  constructor() {
    this.loadData();
  }

  // =========================================
  // HELPERS
  // =========================================

  private normalize(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  private today(): number {
    return this.normalize(new Date());
  }

  isPast(d: Date): boolean {
    return this.normalize(d) < this.today();
  }

  // =========================================
  // BOOKING LOGIC
  // =========================================

  selectDate(date: Date) {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // block past
    if (this.normalize(normalized) < this.today()) return;

    const current = this.selectedRange();

    // first click
    if (!current) {
      this.selectedRange.set([normalized, normalized]);
      return;
    }

    const [start, end] = current;

    // restart if full range already selected
    if (this.normalize(start) !== this.normalize(end)) {
      this.selectedRange.set([normalized, normalized]);
      return;
    }

    // build range
    const newStart = this.normalize(normalized) < this.normalize(start) ? normalized : start;

    const newEnd = this.normalize(normalized) < this.normalize(start) ? start : normalized;

    // block overlap with bookings
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
      (range) =>
        this.normalize(start) <= this.normalize(range.endDate) &&
        this.normalize(end) >= this.normalize(range.startDate),
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

  // =========================================
  // DATA
  // =========================================

  get carId(): string {
    return this.route.snapshot.paramMap.get("id") ?? "";
  }

  loadData(): void {
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

  // =========================================
  // CALENDAR
  // =========================================

  monthName = computed(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + this.monthOffset());

    return date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  });

  days = computed(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + this.monthOffset());
    date.setDate(1);

    const firstDay = date.getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const cells: { date: Date | null; booked: boolean }[] = [];

    // empty cells
    for (let i = 0; i < firstDay; i++) {
      cells.push({ date: null, booked: false });
    }

    // actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const activeDate = new Date(date.getFullYear(), date.getMonth(), day);

      cells.push({
        date: activeDate,
        booked: this.isDateBooked(activeDate),
      });
    }

    return cells;
  });

  isDateBooked(d: Date): boolean {
    const t = this.normalize(d);

    return this.bookedRanges().some(
      (range) => t >= this.normalize(range.startDate) && t <= this.normalize(range.endDate),
    );
  }

  prevMonth(): void {
    this.monthOffset.update((v) => v - 1);
  }

  nextMonth(): void {
    this.monthOffset.update((v) => v + 1);
  }

  // =========================================
  // ACTION
  // =========================================

  bookCar() {
    const range = this.selectedRange();
    if (!range) return;

    const [start, end] = range;

    this.bookingService
      .createBooking({
        carId: this.carId,
        startDate: start,
        endDate: end,
      })
      .subscribe({
        next: () => {
          this.loadData();
          this.selectedRange.set(null);
        },
        error: (err) => console.error(err),
      });
  }
}

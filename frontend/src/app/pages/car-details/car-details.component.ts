import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CarService } from '../../services/car.service';
import { BookingService } from '../../services/booking.service';
import { Car } from '../../models/car.model';
import { Booking } from '../../models/booking.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ImageModule } from 'primeng/image';
import { DividerModule } from 'primeng/divider';


@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ProgressSpinnerModule, ImageModule, DividerModule],
  templateUrl: './car-details.component.html'
})
export class CarDetailsComponent {
  private route = inject(ActivatedRoute);
  private carService = inject(CarService);
  private bookingService = inject(BookingService);

  car = signal<Car | null>(null);
  bookings = signal<Booking[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  monthOffset = signal(0);
  selectedRange = signal<[Date, Date] | null>(null);

  constructor() {
    this.loadData();
  }

  private today(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }

  selectDate(date: Date) {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // 🚫 block past dates
    if (this.normalize(normalized) < this.today()) {
      return;
    }

    const current = this.selectedRange();

    if (!current) {
      this.selectedRange.set([normalized, normalized]);
      return;
    }

    const [start, end] = current;

    if (!this.isRangeValid(start, normalized)) {
      return;
    }

    // restart if already full range
    if (this.normalize(start) !== this.normalize(end)) {
      this.selectedRange.set([normalized, normalized]);
      return;
    }

    if (this.normalize(normalized) < this.normalize(start)) {
      this.selectedRange.set([normalized, start]);
    } else {
      this.selectedRange.set([start, normalized]);
    }
  }
  isPast(d: Date): boolean {
    return this.normalize(d) < this.today();
  }
  private normalize(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  isSelected(d: Date): boolean {
    const range = this.selectedRange();
    if (!range) return false;

    const [start, end] = range;

    const t = this.normalize(d);
    return t >= this.normalize(start) && t <= this.normalize(end);
  }

  totalPrice = computed(() => {
    const range = this.selectedRange();
    const car = this.car();

    if (!range || !car) return 0;

    const [start, end] = range;

    const days =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    return days > 0 ? days * car.pricePerDay : 0;
  });
  isRangeValid(start: Date, end: Date): boolean {
    return !this.bookedRanges().some(range => {
      return (
        this.normalize(start) <= this.normalize(range.endDate) &&
        this.normalize(end) >= this.normalize(range.startDate)
      );
    });
  }
  get carId(): string {
    return this.route.snapshot.paramMap.get('id') ?? '';
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.carService.getCarById(this.carId).subscribe({
      next: car => {
        this.car.set(car);
      },
      error: err => {
        this.error.set(err.error?.message || 'Unable to load car details');
      }
    });

    this.bookingService.getBookingsForCar(this.carId).subscribe({
      next: bookings => {
        this.bookings.set(bookings);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message || 'Unable to load bookings');
        this.loading.set(false);
      }
    });
  }

  bookedRanges = computed(() => {
    return this.bookings().map(b => ({
      startDate: new Date(b.startDate),
      endDate: new Date(b.endDate)
    }));
  });

  monthName = computed(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + this.monthOffset());
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  days = computed(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + this.monthOffset());
    date.setDate(1);

    const firstDay = date.getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const cells: { date: Date | null; booked: boolean }[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ date: null, booked: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const activeDate = new Date(date.getFullYear(), date.getMonth(), day);
      const booked = this.isDateBooked(activeDate);
      cells.push({ date: activeDate, booked });
    }

    return cells;
  });

  isDateBooked(d: Date): boolean {
    const dateStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return this.bookedRanges().some(range => {
      const start = new Date(range.startDate.getFullYear(), range.startDate.getMonth(), range.startDate.getDate());
      const end = new Date(range.endDate.getFullYear(), range.endDate.getMonth(), range.endDate.getDate());
      return dateStart >= start && dateStart <= end;
    });
  }

  prevMonth(): void {
    this.monthOffset.set(this.monthOffset() - 1);
  }

  nextMonth(): void {
    this.monthOffset.set(this.monthOffset() + 1);
  }
  bookCar() {
    const range = this.selectedRange();
    if (!range) return;

    const [start, end] = range;

    this.bookingService.createBooking({
      carId: this.carId,
      startDate: start,
      endDate: end
    }).subscribe({
      next: () => {
        this.loadData(); // refresh bookings
        this.selectedRange.set(null);
      },
      error: err => {
        console.error(err);
      }
    });
  }

}

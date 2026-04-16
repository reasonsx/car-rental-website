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

  constructor() {
    this.loadData();
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
}

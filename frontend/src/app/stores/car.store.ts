import { Injectable, signal, computed, inject } from "@angular/core";
import { Car } from "../models/car.model";
import { CarService } from "../services/car.service";

@Injectable({ providedIn: "root" })
export class CarStore {
  private carService = inject(CarService);

  // state
  private _cars = signal<Car[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // 🔥 global filter
  selectedLocationId = signal<string | null>(null);

  // public readonly
  cars = this._cars.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // computed
  availableCars = computed(() => this._cars().filter((c) => c.available));

  // 🔥 location filtered cars (used everywhere)
  filteredCars = computed(() => {
    const selectedId = this.selectedLocationId();
    const cars = this.availableCars();

    if (!selectedId) return cars;

    return cars.filter((c) => c.locationId._id === selectedId);
  });

  loadCars() {
    if (this._cars().length) return;

    this._loading.set(true);
    this._error.set(null);

    this.carService.getCars().subscribe({
      next: (cars) => {
        this._cars.set(cars);
        this._loading.set(false);
      },
      error: () => {
        this._error.set("Failed to load cars");
        this._loading.set(false);
      },
    });
  }

  getCarById(id: string) {
    return computed(() => this._cars().find((c) => c.id === id) ?? null);
  }
}

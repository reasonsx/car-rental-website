import { Component, signal, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LocationSelectorComponent } from "../../components/location-selector/location-selector.component";
import { CarListComponent } from "../../components/car-list/car-list.component";
import { LocationService } from "../../services/location.service";
import { CarService } from "../../services/car.service";
import { Location } from "../../models/location.model";
import { Car } from "../../models/car.model";
import { CardModule } from "primeng/card";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { SkeletonModule } from "primeng/skeleton";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    CommonModule,
    LocationSelectorComponent,
    CarListComponent,
    CardModule,
    SkeletonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: "./home.component.html",
})
export class HomeComponent {
  // services
  private locationService = inject(LocationService);
  private carService = inject(CarService);

  // state
  locations = signal<Location[]>([]);
  cars = signal<Car[]>([]);
  selectedLocationId = signal<string | undefined>(undefined);
  error = signal<string | null>(null);
  loading = signal(true);

  // computed
  filteredCars = computed(() => {
    const selectedId = this.selectedLocationId();
    const all = this.cars();

    if (!selectedId) return all;

    return all.filter((car) => {
      const id = typeof car.locationId === "object" ? car.locationId._id : car.locationId;
      return id === selectedId;
    });
  });

  // lifecycle replacement (Angular 21 style)
  constructor() {
    this.loadData();
  }

  selectLocation(locationId?: string) {
    this.selectedLocationId.set(locationId);
  }

  private loadData() {
    this.loading.set(true);
    this.error.set(null);

    this.locationService.getLocations().subscribe({
      next: (locations) => this.locations.set(locations),
      error: () => this.error.set("Failed to load locations"),
    });

    this.carService.getCars().subscribe({
      next: (cars) => {
        this.cars.set(cars.filter((c) => c.available));
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Failed to load cars");
        this.loading.set(false);
      },
    });
  }
}

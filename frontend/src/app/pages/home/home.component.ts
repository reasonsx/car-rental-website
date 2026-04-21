import { Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LocationSelectorComponent } from "../../components/location-selector/location-selector.component";
import { CarListComponent } from "../../components/car-list/car-list.component";
import { LocationService } from "../../services/location.service";
import { Location } from "../../models/location.model";
import { CardModule } from "primeng/card";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { SkeletonModule } from "primeng/skeleton";
import { CarStore } from "../../stores/car.store";

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
  private locationService = inject(LocationService);
  private carStore = inject(CarStore);

  locations = signal<Location[]>([]);
  error = signal<string | null>(null);

  cars = this.carStore.filteredCars;
  loading = this.carStore.loading;
  selectedLocationId = this.carStore.selectedLocationId;

  constructor() {
    this.loadLocations();
    this.carStore.loadCars();
  }

  selectLocation(locationId?: string) {
    this.selectedLocationId.set(locationId ?? null);
  }

  private loadLocations() {
    this.locationService.getLocations().subscribe({
      next: this.locations.set,
      error: () => this.error.set("Failed to load locations"),
    });
  }
}

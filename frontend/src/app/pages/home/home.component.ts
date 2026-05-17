import { Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LocationSelectorComponent } from "../../components/location-selector/location-selector.component";
import { CarListComponent } from "../../components/car-list/car-list.component";
import { LocationService } from "../../services/location.service";
import { Location } from "../../models/location.model";
import { SkeletonModule } from "primeng/skeleton";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    CommonModule,
    LocationSelectorComponent,
    CarListComponent,
    SkeletonModule,
  ],
  templateUrl: "./home.component.html",
})
export class HomeComponent {
  private locationService = inject(LocationService);

  locations = signal<Location[]>([]);
  selectedLocationId = signal<string | null>(null);
  error = signal<string | null>(null);

  constructor() {
    this.loadLocations();
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

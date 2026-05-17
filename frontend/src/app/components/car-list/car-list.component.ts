import { Component, computed, signal, effect, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CarCardComponent } from "../car-card/car-card.component";
import { ButtonModule } from "primeng/button";
import { SelectModule } from "primeng/select";
import { TooltipModule } from "primeng/tooltip";
import { FormsModule } from "@angular/forms";
import { CarService } from "../../services/car.service";
import { Car } from "../../models/car.model";

type SortOption = "priceAsc" | "priceDesc" | "yearDesc";

@Component({
  selector: "app-car-list",
  standalone: true,
  imports: [CommonModule, CarCardComponent, ButtonModule, SelectModule, TooltipModule, FormsModule],
  templateUrl: "./car-list.component.html",
})
export class CarListComponent {
  private carService = inject(CarService);

  selectedLocationId = input<string | null>(null);

  cars = signal<Car[]>([]);
  loading = signal(true);

  selectedCategory = signal<string | null>(null);
  selectedBrand = signal<string | null>(null);
  selectedYear = signal<number | null>(null);
  // Default to newest first
  sort = signal<SortOption>("yearDesc");

  filtersActive = computed(() => {
    return (
      !!this.selectedLocationId() ||
      !!this.selectedCategory() ||
      !!this.selectedBrand() ||
      !!this.selectedYear() ||
      this.sort() !== "yearDesc"
    );
  });

  constructor() {
    this.loadCars();
  }

  loadCars() {
    this.loading.set(true);

    this.carService.getCars().subscribe({
      next: (cars) => {
        this.cars.set(cars);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  filteredCars = computed(() => {
    let result = [...this.cars()].filter((c) => c.available);

    if (this.selectedLocationId()) {
      result = result.filter((c) => c.locationId._id === this.selectedLocationId());
    }

    if (this.selectedCategory()) {
      result = result.filter((c) => c.categoryId._id === this.selectedCategory());
    }

    if (this.selectedBrand()) {
      result = result.filter((c) => c.brand === this.selectedBrand());
    }

    if (this.selectedYear()) {
      result = result.filter((c) => c.year === this.selectedYear());
    }

    switch (this.sort()) {
      case "priceAsc":
        result.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "priceDesc":
        result.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "yearDesc":
        result.sort((a, b) => b.year - a.year);
        break;
    }

    return result;
  });

  brands = computed(() =>
    Array.from(new Set(this.cars().map((c) => c.brand))).map((b) => ({
      label: b,
      value: b,
    })),
  );

  years = computed(() =>
    Array.from(new Set(this.cars().map((c) => c.year)))
      .sort((a, b) => b - a)
      .map((y) => ({ label: y.toString(), value: y })),
  );

  resetFilters() {
    this.selectedCategory.set(null);
    this.selectedBrand.set(null);
    this.selectedYear.set(null);
    this.sort.set("yearDesc");
  }
}

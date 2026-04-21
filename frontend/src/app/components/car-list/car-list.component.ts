import { Component, computed, signal, effect, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CarCardComponent } from "../car-card/car-card.component";
import { ButtonModule } from "primeng/button";
import { SelectModule } from "primeng/select";
import { FormsModule } from "@angular/forms";
import { SliderModule } from "primeng/slider";
import { CarStore } from "../../stores/car.store";

type SortOption = "priceAsc" | "priceDesc" | "yearDesc";

@Component({
  selector: "app-car-list",
  standalone: true,
  imports: [CommonModule, CarCardComponent, ButtonModule, SelectModule, FormsModule, SliderModule],
  templateUrl: "./car-list.component.html",
})
export class CarListComponent {
  private carStore = inject(CarStore);

  // 🔥 use filtered cars from store
  cars = this.carStore.filteredCars;

  selectedCategory = signal<string | null>(null);
  selectedBrand = signal<string | null>(null);
  selectedYear = signal<number | null>(null);
  priceRange = signal<[number, number]>([0, 100]);
  sort = signal<SortOption>("priceAsc");

  constructor() {
    effect(() => {
      const cars = this.cars();
      if (cars.length) {
        this.priceRange.set(this.priceBounds());
      }
    });
  }

  priceBounds = computed<[number, number]>(() => {
    const prices = this.cars().map((c) => c.pricePerDay);
    return prices.length ? [Math.min(...prices), Math.max(...prices)] : [0, 100];
  });

  filteredCars = computed(() => {
    let result = [...this.cars()];

    if (this.selectedCategory()) {
      result = result.filter((c) => c.categoryId._id === this.selectedCategory());
    }

    const [min, max] = this.priceRange();
    result = result.filter((c) => c.pricePerDay >= min && c.pricePerDay <= max);

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

  brands = computed(() => {
    const unique = new Set(this.cars().map((c) => c.brand));
    return Array.from(unique).map((b) => ({
      label: b,
      value: b,
    }));
  });

  years = computed(() => {
    const unique = new Set(this.cars().map((c) => c.year));
    return Array.from(unique)
      .sort((a, b) => b - a)
      .map((y) => ({
        label: y.toString(),
        value: y,
      }));
  });

  hasActiveFilters = computed(() => {
    const [min, max] = this.priceRange();
    const [defaultMin, defaultMax] = this.priceBounds();

    return (
      min !== defaultMin ||
      max !== defaultMax ||
      this.selectedCategory() !== null ||
      this.selectedBrand() !== null ||
      this.selectedYear() !== null ||
      this.sort() !== "priceAsc"
    );
  });

  resetFilters() {
    this.selectedCategory.set(null);
    this.selectedBrand.set(null);
    this.selectedYear.set(null);
    this.priceRange.set(this.priceBounds());
    this.sort.set("priceAsc");
  }
}

import { Component, input, computed, signal, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CarCardComponent } from "../car-card/car-card.component";
import { Car } from "../../models/car.model";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { FormsModule } from "@angular/forms";
import { SliderModule } from "primeng/slider";

type SortOption = "priceAsc" | "priceDesc" | "yearDesc";

@Component({
  selector: "app-car-list",
  standalone: true,
  imports: [
    CommonModule,
    CarCardComponent,
    ButtonModule,
    InputTextModule,
    SelectModule,
    FormsModule,
    SliderModule,
  ],
  templateUrl: "./car-list.component.html",
})
export class CarListComponent {
  cars = input<Car[]>([]);

  // filters
  selectedCategory = signal<string | null>(null);
  selectedBrand = signal<string | null>(null);
  priceRange = signal<[number, number]>([0, 100]);
  selectedYear = signal<number | null>(null);

  constructor() {
    effect(() => {
      const [min, max] = this.priceBounds();
      this.priceRange.set([min, max]);
    });
  }

  years = computed(() => {
    const unique = new Set(this.cars().map((car) => car.year));
    return Array.from(unique)
      .sort((a, b) => b - a) // newest first
      .map((y) => ({
        label: y.toString(),
        value: y,
      }));
  });

  priceBounds = computed<[number, number]>(() => {
    const cars = this.cars();
    if (!cars.length) return [0, 100];

    const prices = cars.map((c) => c.pricePerDay);
    return [Math.min(...prices), Math.max(...prices)];
  });

  // sorting
  sort = signal<SortOption>("priceAsc");

  // computed
  filteredCars = computed(() => {
    let result = [...this.cars()];

    // filter by category
    if (this.selectedCategory()) {
      result = result.filter((car) => {
        const categoryId = typeof car.categoryId === "object" ? car.categoryId._id : car.categoryId;

        return categoryId === this.selectedCategory();
      });
    }

    // filter by price
    const [min, max] = this.priceRange();
    result = result.filter((car) => car.pricePerDay >= min && car.pricePerDay <= max);

    // filter by brand
    if (this.selectedBrand()) {
      result = result.filter((car) => car.brand === this.selectedBrand());
    }

    // filter by year
    if (this.selectedYear()) {
      result = result.filter((car) => car.year === this.selectedYear());
    }

    // sorting
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
    const unique = new Set(this.cars().map((car) => car.brand));
    return Array.from(unique).map((b) => ({
      label: b,
      value: b,
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

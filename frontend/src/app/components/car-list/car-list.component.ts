import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarCardComponent } from '../car-card/car-card.component';
import { Car } from '../../models/car.model';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {SelectModule} from 'primeng/select';
import {FormsModule} from '@angular/forms';

type SortOption = 'priceAsc' | 'priceDesc' | 'yearDesc';

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [CommonModule, CarCardComponent, ButtonModule, InputTextModule, SelectModule, FormsModule],
  templateUrl: './car-list.component.html'
})
export class CarListComponent {

  cars = input<Car[]>([]);

  // filters
  selectedCategory = signal<string | null>(null);
  maxPrice = signal<number | null>(null);
  selectedBrand = signal<string | null>(null);

  // sorting
  sort = signal<SortOption>('priceAsc');

  // computed
  filteredCars = computed(() => {
    let result = [...this.cars()];

    // filter by category
    if (this.selectedCategory()) {
      result = result.filter(car => {
        const categoryId =
          typeof car.categoryId === 'object' ? car.categoryId._id : car.categoryId;

        return categoryId === this.selectedCategory();
      });
    }

    // filter by price
    if (this.maxPrice()) {
      result = result.filter(car => car.pricePerDay <= this.maxPrice()!);
    }

    // filter by brand
    if (this.selectedBrand()) {
      result = result.filter(car => car.brand === this.selectedBrand());
    }

    // sorting
    switch (this.sort()) {
      case 'priceAsc':
        result.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'priceDesc':
        result.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'yearDesc':
        result.sort((a, b) => b.year - a.year);
        break;
    }

    return result;
  });

  brands = computed(() => {
    const unique = new Set(this.cars().map(car => car.brand));
    return Array.from(unique).map(b => ({
      label: b,
      value: b
    }));
  });


  hasActiveFilters = computed(() => {
    return (
      this.maxPrice() !== null ||
      this.selectedCategory() !== null ||
      this.selectedBrand() !== null ||
      this.sort() !== 'priceAsc'
    );
  });

  resetFilters() {
    this.selectedCategory.set(null);
    this.selectedBrand.set(null);
    this.maxPrice.set(null);
    this.sort.set('priceAsc');
  }
}

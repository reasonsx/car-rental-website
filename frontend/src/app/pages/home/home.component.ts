import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationSelectorComponent } from '../../components/location-selector/location-selector.component';
import { CarListComponent } from '../../components/car-list/car-list.component';
import { LocationService } from '../../services/location.service';
import { CarService } from '../../services/car.service';
import { Location } from '../../models/location.model';
import { Car } from '../../models/car.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LocationSelectorComponent, CarListComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  locations = signal<Location[]>([]);
  allCars = signal<Car[]>([]);
  selectedLocationId = signal<string | undefined>(undefined);
  error = signal<string | undefined>(undefined);

  filteredCars = computed(() => {
    const selectedId = this.selectedLocationId();
    const cars = this.allCars();

    console.log('Filtering cars:', { selectedId, totalCars: cars.length, cars: cars.map(c => ({ id: c._id, locationId: c.locationId })) });

    if (!selectedId) {
      return cars;
    }

    const filtered = cars.filter((car) => {
      // locationId might be a string (ObjectId) or an object (populated)
      const carLocationId = typeof car.locationId === 'object' ? car.locationId._id : car.locationId;
      return carLocationId === selectedId;
    });
    console.log('Filtered cars:', filtered.length, filtered);
    return filtered;
  });

  constructor(
    private locationService: LocationService,
    private carService: CarService
  ) {}

  ngOnInit() {
    this.loadLocations();
    this.loadCars();
  }

  selectLocation(locationId?: string) {
    console.log('Selecting location:', locationId);
    this.selectedLocationId.set(locationId);
  }

  private loadLocations() {
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        console.log('Loaded locations:', locations);
        this.locations.set(locations);
      },
      error: () => this.error.set('Unable to load locations'),
    });
  }

  private loadCars() {
    this.carService.getCars().subscribe({
      next: (cars) => {
        console.log('Loaded cars:', cars.map(c => ({ id: c._id, locationId: c.locationId, brand: c.brand })));
        this.allCars.set(cars.filter((car) => car.available));
      },
      error: () => this.error.set('Unable to load cars'),
    });
  }
}
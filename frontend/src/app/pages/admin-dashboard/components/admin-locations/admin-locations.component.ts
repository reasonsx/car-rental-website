import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { LocationService } from '../../../../services/location.service';
import { Location } from '../../../../models/location.model';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-locations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    TableModule
  ],
  templateUrl: './admin-locations.component.html'
})
export class AdminLocationsComponent {

  private fb = inject(FormBuilder);
  private locationService = inject(LocationService);

  // state
  locations = signal<Location[]>([]);
  selectedLocation = signal<Location | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // typed form
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    city: ['', Validators.required],
    address: ['', Validators.required],
    phone: ['', Validators.required]
  });

  constructor() {
    this.loadLocations();
  }

  // ========================
  // DATA
  // ========================

  loadLocations(): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.locations.set(locations);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load locations');
        this.loading.set(false);
      }
    });
  }

  // ========================
  // EDIT
  // ========================

  editLocation(location: Location): void {
    this.selectedLocation.set(location);

    this.form.patchValue({
      name: location.name,
      city: location.city,
      address: location.address,
      phone: location.phone
    });

    this.error.set(null);
    this.success.set(null);
  }

  cancelEdit(): void {
    this.selectedLocation.set(null);

    this.form.reset({
      name: '',
      city: '',
      address: '',
      phone: ''
    });

    this.error.set(null);
    this.success.set(null);
  }

  // ========================
  // SAVE
  // ========================

  saveLocation(): void {
    if (this.form.invalid) return;

    const data = this.form.getRawValue();

    const request = this.selectedLocation()
      ? this.locationService.updateLocation(this.selectedLocation()?._id ?? '', data)
      : this.locationService.createLocation(data);

    request.subscribe({
      next: () => {
        this.success.set(
          this.selectedLocation() ? 'Location updated' : 'Location created'
        );

        this.cancelEdit();
        this.loadLocations();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to save location');
      }
    });
  }

  // ========================
  // DELETE
  // ========================

  deleteLocation(id: string): void {
    if (!confirm('Delete this location?')) return;

    this.locationService.deleteLocation(id).subscribe({
      next: () => {
        this.success.set('Location deleted');
        this.loadLocations();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to delete location');
      }
    });
  }
}

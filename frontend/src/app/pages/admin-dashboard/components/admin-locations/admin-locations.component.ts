import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationService } from '../../../../services/location.service';
import { Location } from '../../../../models/location.model';

@Component({
  selector: 'app-admin-locations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-locations.component.html',
  styleUrls: ['./admin-locations.component.scss']
})
export class AdminLocationsComponent {
  locations = signal<Location[]>([]);
  selectedLocation = signal<Location | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form: FormGroup;

  constructor(private fb: FormBuilder, private locationService: LocationService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required]
    });

    this.loadLocations();
  }

  loadLocations(): void {
    this.loading.set(true);
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

  editLocation(location: Location): void {
    this.selectedLocation.set(location);
    this.form.setValue({
      name: location.name,
      city: location.city,
      address: location.address,
      phone: location.phone
    });
    this.success.set(null);
    this.error.set(null);
  }

  saveLocation(): void {
    if (this.form.invalid) return;

    const data = this.form.value;
    const operation = this.selectedLocation() ?
      this.locationService.updateLocation(this.selectedLocation()?._id ?? '', data) :
      this.locationService.createLocation(data);

    operation.subscribe({
      next: () => {
        this.success.set(this.selectedLocation() ? 'Location updated' : 'Location created');
        this.cancelEdit();
        this.loadLocations();
      },
      error: (err) => this.error.set(err.error?.message || 'Failed to save location')
    });
  }

  deleteLocation(id: string): void {
    if (!confirm('Delete this location?')) return;
    this.locationService.deleteLocation(id).subscribe({
      next: () => {
        this.success.set('Location deleted');
        this.loadLocations();
      },
      error: (err) => this.error.set(err.error?.message || 'Failed to delete location')
    });
  }

  cancelEdit(): void {
    this.selectedLocation.set(null);
    this.form.reset();
    this.error.set(null);
    this.success.set(null);
  }
}

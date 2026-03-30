import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '../../models/location.model';

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-selector.component.html',
  styleUrls: ['./location-selector.component.scss']
})
export class LocationSelectorComponent {
  @Input() locations: Location[] = [];
  @Input() selectedLocationId?: string;

  @Output() selectedLocationChange = new EventEmitter<string | undefined>();

  onLocationChange(locationId: string) {
    this.selectedLocationChange.emit(locationId || undefined);
  }
}

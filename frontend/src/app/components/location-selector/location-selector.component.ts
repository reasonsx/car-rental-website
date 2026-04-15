import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';

import { Location } from '../../models/location.model';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [CommonModule, SelectModule, FormsModule],
  templateUrl: './location-selector.component.html'
})
export class LocationSelectorComponent {
  @Input() locations: Location[] = [];
  @Input() selectedLocationId?: string;

  @Output() selectedLocationChange = new EventEmitter<string | undefined>();

  onLocationChange(locationId: string) {
    this.selectedLocationChange.emit(locationId || undefined);
  }
}

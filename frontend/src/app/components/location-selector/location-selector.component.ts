import { Component, input, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SelectModule } from "primeng/select";
import { FormsModule } from "@angular/forms";

import { Location } from "../../models/location.model";

@Component({
  selector: "app-location-selector",
  standalone: true,
  imports: [CommonModule, SelectModule, FormsModule],
  templateUrl: "./location-selector.component.html",
})
export class LocationSelectorComponent {
  locations = input<Location[]>([]);
  selectedLocationId = input<string | undefined>();

  selectedLocationChange = output<string | undefined>();

  onLocationChange(locationId: string | null) {
    this.selectedLocationChange.emit(locationId || undefined);
  }
}

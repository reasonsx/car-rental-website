import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarCardComponent } from '../car-card/car-card.component';
import { Car } from '../../models/car.model';

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [CommonModule, CarCardComponent],
  templateUrl: './car-list.component.html'
})
export class CarListComponent {
  @Input() cars: Car[] = [];
}

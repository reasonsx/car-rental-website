import { Component, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Car } from '../../models/car.model';
import { ImageModule } from 'primeng/image';
@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ImageModule],
  templateUrl: './car-card.component.html'
})
export class CarCardComponent {
  car = input.required<Car>();
}

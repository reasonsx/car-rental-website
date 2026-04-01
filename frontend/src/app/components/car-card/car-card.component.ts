import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Car } from '../../models/car.model';

@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './car-card.component.html',
  styleUrls: ['./car-card.component.scss']
})
export class CarCardComponent {
  @Input() car!: Car;
}

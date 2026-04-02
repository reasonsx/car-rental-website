import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCarsComponent } from './components/admin-cars/admin-cars.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminBookingsComponent } from './components/admin-bookings/admin-bookings.component';
import { AdminCategoriesComponent } from './components/admin-categories/admin-categories.component';
import { AdminLocationsComponent } from './components/admin-locations/admin-locations.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminCarsComponent,
    AdminUsersComponent,
    AdminBookingsComponent,
    AdminCategoriesComponent,
    AdminLocationsComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  activeTab = signal<'cars' | 'users' | 'bookings' | 'categories' | 'locations'>('cars');

  setActiveTab(tab: 'cars' | 'users' | 'bookings' | 'categories' | 'locations'): void {
    this.activeTab.set(tab);
  }
}
import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TabsModule } from "primeng/tabs";

import { AdminCarsComponent } from "./components/admin-cars/admin-cars.component";
import { AdminUsersComponent } from "./components/admin-users/admin-users.component";
import { AdminBookingsComponent } from "./components/admin-bookings/admin-bookings.component";
import { AdminCategoriesComponent } from "./components/admin-categories/admin-categories.component";
import { AdminLocationsComponent } from "./components/admin-locations/admin-locations.component";

type TabKey = "cars" | "users" | "bookings" | "categories" | "locations";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [
    TabsModule,
    AdminCarsComponent,
    AdminUsersComponent,
    AdminBookingsComponent,
    AdminCategoriesComponent,
    AdminLocationsComponent,
  ],
  templateUrl: "./admin-dashboard.component.html",
})
export class AdminDashboardComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tabs = [
    {
      key: "cars" as TabKey,
      label: "Cars",
      icon: "pi pi-car",
    },
    {
      key: "users" as TabKey,
      label: "Users",
      icon: "pi pi-users",
    },
    {
      key: "bookings" as TabKey,
      label: "Bookings",
      icon: "pi pi-calendar",
    },
    {
      key: "categories" as TabKey,
      label: "Categories",
      icon: "pi pi-tags",
    },
    {
      key: "locations" as TabKey,
      label: "Locations",
      icon: "pi pi-map-marker",
    },
  ];

  activeTab = signal<TabKey>("cars");

  constructor() {
    this.route.queryParams.subscribe((params) => {
      const tab = params["tab"] as TabKey;

      if (tab && this.tabs.some((t) => t.key === tab)) {
        this.activeTab.set(tab);
      }
    });
  }

  onTabChange(tab: string | number | undefined) {
    if (!tab) return;

    const tabKey = tab as TabKey;

    this.activeTab.set(tabKey);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabKey },
      queryParamsHandling: "merge",
    });
  }
}

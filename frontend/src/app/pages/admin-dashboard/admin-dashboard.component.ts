import { Component, inject, signal, effect } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "primeng/tabs";

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
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
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
    { key: "cars" as TabKey, label: "Cars" },
    { key: "users" as TabKey, label: "Users" },
    { key: "bookings" as TabKey, label: "Bookings" },
    { key: "categories" as TabKey, label: "Categories" },
    { key: "locations" as TabKey, label: "Locations" },
  ];
  
  activeTab = signal<TabKey>("cars");

  constructor() {
    // Read tab from URL query parameter on init
    this.route.queryParams.subscribe((params) => {
      const tab = params["tab"] as TabKey;
      if (tab && this.tabs.some((t) => t.key === tab)) {
        this.activeTab.set(tab);
      }
    });

    // Update URL when tab changes
    effect(() => {
      const currentTab = this.activeTab();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: currentTab },
        queryParamsHandling: "merge",
      });
    });
  }

  onTabChange(tabKey: TabKey): void {
    this.activeTab.set(tabKey);
  }
}

import { Component } from "@angular/core";
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
  tabs = [
    { key: "cars" as TabKey, label: "Cars" },
    { key: "users" as TabKey, label: "Users" },
    { key: "bookings" as TabKey, label: "Bookings" },
    { key: "categories" as TabKey, label: "Categories" },
    { key: "locations" as TabKey, label: "Locations" },
  ];
  activeTab: TabKey = "cars";
}

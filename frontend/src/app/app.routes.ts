import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { AdminDashboardComponent } from "./pages/admin-dashboard/admin-dashboard.component";
import { CarDetailsComponent } from "./pages/car-details/car-details.component";
import { AuthGuard } from "./guards/auth.guard";
import { AdminGuard } from "./guards/admin.guard";
import { AuthComponent } from "./pages/auth/auth.component";

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "login", component: AuthComponent },
  { path: "profile", component: ProfileComponent, canActivate: [AuthGuard] },
  { path: "admin", component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: "car/:id", component: CarDetailsComponent },
  { path: "**", redirectTo: "" },
];

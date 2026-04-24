import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { AdminDashboardComponent } from "./pages/admin-dashboard/admin-dashboard.component";
import { CarDetailsComponent } from "./pages/car-details/car-details.component";
import { AuthGuard } from "./guards/auth.guard";
import { AdminGuard } from "./guards/admin.guard";
import { AuthComponent } from "./pages/auth/auth.component";
import { CheckoutComponent } from "./pages/checkout/checkout.component";
import { PaymentComponent } from "./pages/payment/payment.component";
import { ConfirmationComponent } from "./pages/confirmation/confirmation.component";

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "login", component: AuthComponent },
  { path: "profile", component: ProfileComponent, canActivate: [AuthGuard] },
  { path: "admin", component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: "car/:id", component: CarDetailsComponent },
  { path: "checkout", component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: "payment", component: PaymentComponent, canActivate: [AuthGuard] },
  { path: "confirmation", component: ConfirmationComponent, canActivate: [AuthGuard] },
  { path: "**", redirectTo: "" },
];

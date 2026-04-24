import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-confirmation",
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: "./confirmation.html",
})
export class ConfirmationComponent {
  private router = inject(Router);

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}

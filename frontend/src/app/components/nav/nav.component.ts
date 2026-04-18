import { Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-nav",
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: "./nav.component.html",
})
export class NavComponent {
  private authService = inject(AuthService);

  isAuthenticated = computed(() => this.authService.isAuthenticated());
  isAdmin = computed(() => this.authService.isAdmin());
  currentUser = computed(() => this.authService.currentUser());

  logout(): void {
    this.authService.logout();
  }
}

import { Component, inject, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavComponent } from "./components/nav/nav.component";
import { CarStore } from "./stores/car.store";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [NavComponent, RouterOutlet],
  templateUrl: "./app.component.html",
})
export class App {
  private carStore = inject(CarStore);

  constructor() {
    this.carStore.loadCars();
  }
}

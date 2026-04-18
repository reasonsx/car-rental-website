import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavComponent } from "./components/nav/nav.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [NavComponent, RouterOutlet],
  templateUrl: "./app.component.html",
})
export class App {
  protected readonly title = signal("frontend");
}

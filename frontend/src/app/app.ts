import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavComponent, RouterOutlet],
  template: `
    <app-nav></app-nav>
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('frontend');
}


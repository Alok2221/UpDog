import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/layout/header/header.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />
    <main class="main">
      <router-outlet />
    </main>
  `,
  styles: [`
    .main {
      min-height: calc(100vh - 56px);
      padding-top: 1rem;
      padding-bottom: 2rem;
    }
  `],
})
export class AppComponent {
  private theme = inject(ThemeService);
  constructor() {
    this.theme.init();
  }
}

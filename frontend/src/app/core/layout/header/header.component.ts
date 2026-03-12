import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="container header-inner">
        <a routerLink="/" class="logo">UpDog</a>
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/feed" routerLinkActive="active">Feed</a>
            <a routerLink="/saved" routerLinkActive="active">Saved</a>
          }
          <a routerLink="/search" routerLinkActive="active">Search</a>
        </nav>
        <div class="header-actions">
          @if (auth.isLoggedIn()) {
            <span class="user-karma">{{ auth.user()?.karma }} karma</span>
            <a routerLink="/create-post" class="btn btn-primary">New post</a>
            <a routerLink="/create-subreddit" class="btn btn-secondary">Create community</a>
            <button type="button" class="btn btn-icon" (click)="theme.toggle()" [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'" title="{{ theme.isDark() ? 'Light mode' : 'Dark mode' }}">
              {{ theme.isDark() ? '☀️' : '🌙' }}
            </button>
            <button type="button" class="btn btn-ghost" (click)="logout()">Log out</button>
          } @else {
            <button type="button" class="btn btn-icon" (click)="theme.toggle()" [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">{{ theme.isDark() ? '☀️' : '🌙' }}</button>
            <a routerLink="/login" class="btn btn-ghost">Log in</a>
            <a routerLink="/register" class="btn btn-primary">Sign up</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow);
    }
    .header-inner {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      min-height: 56px;
      flex-wrap: wrap;
    }
    .logo {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--accent);
      text-decoration: none;
    }
    .logo:hover { text-decoration: none; color: var(--accent-hover); }
    .nav {
      display: flex;
      gap: 1rem;
    }
    .nav a {
      color: var(--text-secondary);
      text-decoration: none;
    }
    .nav a:hover, .nav a.active { color: var(--text-primary); font-weight: 500; }
    .header-actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .user-karma {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      border-radius: var(--radius);
      font-weight: 500;
      border: none;
      text-decoration: none;
      font-size: 0.875rem;
    }
    .btn-icon {
      padding: 0.5rem;
      font-size: 1.1rem;
      background: transparent;
      color: var(--text-secondary);
    }
    .btn-icon:hover { color: var(--accent); }
    .btn-primary {
      background: var(--accent);
      color: white;
    }
    .btn-primary:hover { background: var(--accent-hover); color: white; }
    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover { background: var(--border); }
    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
    }
    .btn-ghost:hover { color: var(--text-primary); }
    @media (max-width: 768px) {
      .nav { display: none; }
      .header-actions { margin-left: 0; }
    }
  `],
})
export class HeaderComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);

  logout() {
    this.auth.logout();
  }
}

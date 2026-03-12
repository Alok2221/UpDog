import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Activate account</h1>

        @if (codeFromUrl) {
          @if (loading) {
            <p>Activating...</p>
          } @else if (errorMessage) {
            <p class="error">{{ errorMessage }}</p>
            <a routerLink="/login" class="btn btn-primary">Go to login</a>
          } @else if (success) {
            <p class="success">Account activated. You can log in now.</p>
            <a routerLink="/login" class="btn btn-primary">Log in</a>
          }
        } @else {
          <p class="muted">Check your email for the activation link. If you didn't receive it, enter your email below to get the activation code.</p>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" [(ngModel)]="email" placeholder="e.g. user&#64;example.com" />
          </div>
          <button type="button" class="btn btn-primary btn-block" (click)="fetchDevCode()" [disabled]="!email || loadingDev">
            {{ loadingDev ? 'Loading...' : 'Get activation code' }}
          </button>
          @if (devCodeError) {
            <p class="error">{{ devCodeError }}</p>
          }
          @if (devLink) {
            <p class="success">Click the link or copy the code and paste it in the URL.</p>
            <a [href]="devLink" class="btn btn-primary btn-block">Activate account (link)</a>
            <p class="muted small">Code: <code>{{ devCode }}</code></p>
          }
          <p class="footer">
            <a routerLink="/login">Back to login</a>
          </p>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page { padding: 2rem 1rem; display: flex; justify-content: center; min-height: 60vh; }
    .auth-card {
      width: 100%;
      max-width: 400px;
      background: var(--bg-card);
      border-radius: var(--radius);
      padding: 2rem;
      border: 1px solid var(--border);
    }
    .auth-card h1 { margin: 0 0 1.5rem; font-size: 1.5rem; }
    .error { color: #f87171; margin-bottom: 1rem; font-size: 0.875rem; }
    .success { color: #4ade80; margin-bottom: 1rem; font-size: 0.875rem; }
    .muted { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem; }
    .small { font-size: 0.75rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; }
    .field input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-secondary);
      color: var(--text-primary);
    }
    .btn { margin-top: 0.5rem; }
    .btn-block { width: 100%; display: block; text-align: center; }
    .footer { margin-top: 1.5rem; font-size: 0.875rem; }
    code { font-size: 0.8em; background: var(--bg-secondary); padding: 0.2rem 0.4rem; border-radius: 4px; }
  `],
})
export class ActivateComponent implements OnInit {
  loading = true;
  success = false;
  errorMessage = '';
  codeFromUrl = false;
  email = '';
  loadingDev = false;
  devCode = '';
  devLink = '';
  devCodeError = '';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    const code = params['code'];
    const emailParam = params['email'];
    if (emailParam) this.email = emailParam;

    if (code) {
      this.codeFromUrl = true;
      this.auth.activate(code).subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.error || 'Invalid or expired code.';
        },
      });
    } else {
      this.loading = false;
      this.codeFromUrl = false;
    }
  }

  fetchDevCode() {
    if (!this.email) return;
    this.loadingDev = true;
    this.devCodeError = '';
    this.devLink = '';
    this.devCode = '';
    this.auth.getDevActivationCode(this.email).subscribe({
      next: (res) => {
        this.loadingDev = false;
        this.devCode = res.code;
        this.devLink = res.link;
      },
      error: () => {
        this.loadingDev = false;
        this.devCodeError = 'No code for this email. Register first.';
      },
    });
  }
}

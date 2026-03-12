import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Log in</h1>
        @if (errorMessage) {
          <p class="error">{{ errorMessage }}</p>
        }
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="username">Username</label>
            <input id="username" type="text" formControlName="username" autocomplete="username" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" autocomplete="current-password" />
          </div>
          <button type="submit" class="btn btn-primary btn-block" [disabled]="form.invalid || loading">
            {{ loading ? 'Signing in...' : 'Log in' }}
          </button>
        </form>
        <p class="footer">
          <a routerLink="/forgot-password">Forgot password?</a>
          <a routerLink="/register">Sign up</a>
        </p>
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
    .field { margin-bottom: 1rem; }
    .field label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; color: var(--text-secondary); }
    .field input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-secondary);
      color: var(--text-primary);
    }
    .btn-block { width: 100%; margin-top: 0.5rem; }
    .footer { margin-top: 1.5rem; display: flex; justify-content: space-between; font-size: 0.875rem; }
  `],
})
export class LoginComponent {
  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth.login(this.form.getRawValue().username, this.form.getRawValue().password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || err.error?.message || 'Login failed.';
      },
    });
  }
}

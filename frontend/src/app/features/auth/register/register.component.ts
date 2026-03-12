import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Sign up</h1>
        @if (success) {
          <div class="success-block">
            <p class="success">We've sent you an email with an activation link.</p>
            <p class="muted">Check your inbox (and spam folder) and click the link to activate your account. The link is valid for 60 minutes.</p>
            <a routerLink="/login" class="btn btn-primary btn-block">Go to login</a>
            <p class="footer">
              <a routerLink="/activate" [queryParams]="{ email: registeredEmail }">Didn't receive the email? Get activation code</a>
            </p>
          </div>
        } @else {
          @if (errorMessage) {
            <p class="error">{{ errorMessage }}</p>
          }
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="field">
              <label for="username">Username</label>
              <input id="username" type="text" formControlName="username" autocomplete="username" />
            </div>
            <div class="field">
              <label for="email">Email</label>
              <input id="email" type="email" formControlName="email" autocomplete="email" />
            </div>
            <div class="field">
              <label for="password">Password (min. 8 characters)</label>
              <input id="password" type="password" formControlName="password" autocomplete="new-password" />
            </div>
            <button type="submit" class="btn btn-primary btn-block" [disabled]="form.invalid || loading">
              {{ loading ? 'Signing up...' : 'Sign up' }}
            </button>
          </form>
          <p class="footer">
            <a routerLink="/login">Already have an account? Log in</a>
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
    .success { color: #4ade80; margin-bottom: 0.5rem; font-size: 0.875rem; }
    .success-block .muted { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem; }
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
    .footer { margin-top: 1.5rem; font-size: 0.875rem; }
  `],
})
export class RegisterComponent {
  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });
  loading = false;
  success = false;
  registeredEmail = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    const { username, email, password } = this.form.getRawValue();
    this.auth.register(username, email, password).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.registeredEmail = email;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || err.error?.message || 'Registration failed.';
      },
    });
  }
}

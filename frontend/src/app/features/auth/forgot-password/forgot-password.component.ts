import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Reset password</h1>
        @if (message) {
          <p class="success">{{ message }}</p>
        }
        @if (errorMessage) {
          <p class="error">{{ errorMessage }}</p>
        }
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" autocomplete="email" />
          </div>
          <button type="submit" class="btn btn-primary btn-block" [disabled]="form.invalid || loading">
            {{ loading ? 'Sending...' : 'Send reset link' }}
          </button>
        </form>
        <p class="footer">
          <a routerLink="/login">Back to login</a>
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
    .success { color: #4ade80; margin-bottom: 1rem; font-size: 0.875rem; }
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
export class ForgotPasswordComponent {
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  loading = false;
  message = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
  ) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.message = '';
    this.errorMessage = '';
    this.auth.forgotPassword(this.form.getRawValue().email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = res?.message || 'If an account exists, you will receive a reset link.';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Something went wrong.';
      },
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Set new password</h1>
        @if (errorMessage) {
          <p class="error">{{ errorMessage }}</p>
        }
        @if (success) {
          <p class="success">Password changed. You can log in now.</p>
          <a routerLink="/login" class="btn btn-primary">Log in</a>
        } @else if (code) {
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="field">
              <label for="newPassword">New password (min. 8 characters)</label>
              <input id="newPassword" type="password" formControlName="newPassword" autocomplete="new-password" />
            </div>
            <button type="submit" class="btn btn-primary btn-block" [disabled]="form.invalid || loading">
              {{ loading ? 'Saving...' : 'Save password' }}
            </button>
          </form>
        } @else {
          <p class="error">No reset code. Use the link from your email.</p>
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
    .error { color: #f87171; margin-bottom: 1rem; }
    .success { color: #4ade80; margin-bottom: 1rem; }
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
  `],
})
export class ResetPasswordComponent implements OnInit {
  code = '';
  form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });
  loading = false;
  success = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    this.code = this.route.snapshot.queryParams['code'] || '';
  }

  onSubmit() {
    if (this.form.invalid || !this.code) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth.resetPassword(this.code, this.form.getRawValue().newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Failed to reset password.';
      },
    });
  }
}

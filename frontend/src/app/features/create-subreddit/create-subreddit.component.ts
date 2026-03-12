import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-create-subreddit',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="create-wrapper">
      <header class="create-header">
        <h1>Create a community</h1>
        <p class="subtitle">
          Pick a short, memorable name and describe what your community is about.
        </p>
      </header>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card">
        @if (errorMessage) {
          <div class="alert error">
            {{ errorMessage }}
          </div>
        }

        <div class="field">
          <label for="name">Community name</label>
          <div class="input-row">
            <span class="prefix">r/</span>
            <input
              id="name"
              type="text"
              formControlName="name"
              autocomplete="off"
              placeholder="e.g. programming, dogs, movies"
              [class.invalid]="nameInvalid"
            />
          </div>
          <div class="help">
            <span>Between 2 and 100 characters. Only letters, numbers and underscores are recommended.</span>
            <span class="counter">{{ form.controls.name.value.length }}/100</span>
          </div>
          @if (nameInvalid) {
            <p class="field-error">
              {{ nameErrorMessage }}
            </p>
          }
        </div>

        <div class="field">
          <label for="description">Description <span class="muted">(optional)</span></label>
          <textarea
            id="description"
            formControlName="description"
            rows="4"
            placeholder="Describe the purpose of your community, rules, and what people can post."
          ></textarea>
          <div class="help">
            <span>Help people understand what your community is about.</span>
          </div>
        </div>

        <div class="field field-inline">
          <label class="checkbox-label">
            <input type="checkbox" formControlName="isPrivate" />
            <span>
              Private community
              <span class="muted block">
                Only approved members can see posts and comments.
              </span>
            </span>
          </label>
        </div>

        <div class="actions">
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="form.invalid || loading"
          >
            {{ loading ? 'Creating community...' : 'Create community' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .create-wrapper {
      max-width: 640px;
      margin: 0 auto;
      padding: 1.5rem 1rem 2rem;
    }

    .create-header h1 {
      margin: 0 0 0.25rem;
      font-size: 1.75rem;
      font-weight: 600;
    }

    .subtitle {
      margin: 0 0 1.5rem;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .card {
      padding: 1.5rem;
      border-radius: var(--radius-lg, 0.75rem);
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      box-shadow: 0 18px 45px rgba(0, 0, 0, 0.24);
    }

    .alert {
      border-radius: var(--radius);
      padding: 0.75rem 0.9rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .alert.error {
      background: rgba(248, 113, 113, 0.12);
      border: 1px solid rgba(248, 113, 113, 0.7);
      color: #fecaca;
    }

    .field {
      margin-bottom: 1.25rem;
    }

    .field-inline {
      margin-top: 0.75rem;
    }

    label {
      display: block;
      margin-bottom: 0.35rem;
      font-weight: 500;
      color: var(--text-primary);
      font-size: 0.95rem;
    }

    .muted {
      color: var(--text-secondary);
      font-weight: 400;
      font-size: 0.85rem;
    }

    .muted.block {
      display: block;
      margin-top: 0.15rem;
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      border-radius: var(--radius);
      background: var(--bg-primary);
      padding: 0 0.4rem 0 0;
      border: 1px solid var(--border);
    }

    .prefix {
      padding: 0 0.55rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    input[type="text"],
    textarea {
      width: 100%;
      padding: 0.55rem 0.7rem;
      border-radius: var(--radius);
      border: none;
      outline: none;
      background: transparent;
      color: var(--text-primary);
      font: inherit;
    }

    textarea {
      border: 1px solid var(--border);
      background: var(--bg-primary);
      resize: vertical;
      min-height: 120px;
    }

    input.invalid {
      box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.7);
    }

    .help {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.25rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
      gap: 0.5rem;
    }

    .counter {
      font-variant-numeric: tabular-nums;
      color: var(--text-secondary);
    }

    .field-error {
      margin: 0.25rem 0 0;
      font-size: 0.8rem;
      color: #fca5a5;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.95rem;
      cursor: pointer;
      user-select: none;
    }

    .checkbox-label input {
      margin-top: 0.15rem;
    }

    .actions {
      margin-top: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }

    .btn.btn-primary[disabled] {
      opacity: 0.7;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      .create-wrapper {
        padding-inline: 0.75rem;
      }

      .card {
        padding: 1.1rem 1rem;
      }
    }
  `],
})
export class CreateSubredditComponent {
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: [''],
    isPrivate: [false],
  });
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
  ) {}

  get nameInvalid(): boolean {
    const c = this.form.controls.name;
    return c.invalid && (c.dirty || c.touched);
  }

  get nameErrorMessage(): string {
    const c = this.form.controls.name;
    if (!c.errors) return '';
    if (c.errors['required']) {
      return 'Community name is required.';
    }
    if (c.errors['minlength']) {
      return 'Community name is too short.';
    }
    if (c.errors['maxlength']) {
      return 'Community name is too long.';
    }
    return 'Please provide a valid community name.';
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    const v = this.form.getRawValue();
    this.api.createSubreddit({
      name: v.name.trim().toLowerCase(),
      description: v.description || undefined,
      isPrivate: v.isPrivate,
    }).subscribe({
      next: (sub) => {
        this.loading = false;
        this.router.navigate(['/r', sub.name]);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Failed to create.';
      },
    });
  }
}

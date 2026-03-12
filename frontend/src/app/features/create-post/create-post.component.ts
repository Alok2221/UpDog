import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, SubredditDto } from '../../core/services/api.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-wrapper">
      <header class="create-header">
        <h1>Create a post</h1>
        <p class="subtitle">
          Share text, a link, or an image in a community.
        </p>
      </header>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card">
        @if (errorMessage) {
          <div class="alert error">
            {{ errorMessage }}
          </div>
        }

        <div class="field">
          <label for="subreddit">Community</label>
          <select id="subreddit" formControlName="subredditId" [disabled]="subredditLocked">
            <option [ngValue]="null" disabled>Select community</option>
            @for (s of subreddits; track s.id) {
              <option [ngValue]="s.id">r/{{ s.name }}</option>
            }
          </select>
        </div>

        <div class="field">
          <label for="title">Title</label>
          <input
            id="title"
            type="text"
            formControlName="title"
            maxlength="300"
            [class.invalid]="titleInvalid"
            placeholder="What do you want to share?"
          />
          <div class="help">
            <span>Make it clear and descriptive.</span>
            <span class="counter">{{ form.controls.title.value.length }}/300</span>
          </div>
          @if (titleInvalid) {
            <p class="field-error">Title is required.</p>
          }
        </div>

        <div class="field">
          <label>Post type</label>
          <div class="type-toggle">
            <button
              type="button"
              class="chip"
              [class.active]="form.controls.postType.value === 'TEXT'"
              (click)="setType('TEXT')"
            >
              Text
            </button>
            <button
              type="button"
              class="chip"
              [class.active]="form.controls.postType.value === 'IMAGE'"
              (click)="setType('IMAGE')"
            >
              Image
            </button>
            <button
              type="button"
              class="chip"
              [class.active]="form.controls.postType.value === 'LINK'"
              (click)="setType('LINK')"
            >
              Link
            </button>
          </div>
        </div>

        <!-- Text content (always available as description/body) -->
        <div class="field">
          <label for="content">Text (optional)</label>
          <textarea
            id="content"
            formControlName="content"
            rows="5"
            placeholder="Write your post text or add a caption for your image."
          ></textarea>
        </div>

        <!-- Link-specific input -->
        @if (form.controls.postType.value === 'LINK') {
          <div class="field">
            <label for="linkUrl">Link URL</label>
            <input
              id="linkUrl"
              type="url"
              formControlName="linkUrl"
              placeholder="https://example.com"
            />
          </div>
        }

        <!-- Image-specific inputs: URL or file -->
        @if (form.controls.postType.value === 'IMAGE') {
          <div class="field">
            <label>Image source</label>
            <div class="type-toggle">
              <button
                type="button"
                class="chip"
                [class.active]="imageSource === 'file'"
                (click)="setImageSource('file')"
              >
                From device
              </button>
              <button
                type="button"
                class="chip"
                [class.active]="imageSource === 'url'"
                (click)="setImageSource('url')"
              >
                From link
              </button>
            </div>
          </div>

          @if (imageSource === 'url') {
            <div class="field">
              <label for="imageUrl">Image URL</label>
              <input
                id="imageUrl"
                type="url"
                formControlName="imageUrl"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          } @else {
            <div class="field">
              <label for="imageFile">Image file</label>
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                (change)="onFileSelected($event)"
              />
              @if (imagePreviewUrl) {
                <div class="image-preview">
                  <img [src]="imagePreviewUrl" alt="Selected image preview" />
                </div>
              }
            </div>
          }
        }

        <div class="actions">
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="form.invalid || loading || imageUploadInProgress"
          >
            {{ loading || imageUploadInProgress ? 'Publishing...' : 'Publish post' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .create-wrapper {
      max-width: 720px;
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

    label {
      display: block;
      margin-bottom: 0.35rem;
      font-weight: 500;
      color: var(--text-primary);
      font-size: 0.95rem;
    }

    select,
    input[type="text"],
    input[type="url"],
    textarea {
      width: 100%;
      padding: 0.55rem 0.7rem;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background: var(--bg-primary);
      color: var(--text-primary);
      font: inherit;
    }

    textarea {
      resize: vertical;
      min-height: 140px;
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

    .type-toggle {
      display: inline-flex;
      gap: 0.5rem;
      background: var(--bg-primary);
      padding: 0.2rem;
      border-radius: 999px;
    }

    .chip {
      border: none;
      border-radius: 999px;
      padding: 0.3rem 0.9rem;
      font-size: 0.85rem;
      color: var(--text-secondary);
      background: transparent;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .chip.active {
      background: var(--accent);
      color: #0b0b0f;
      font-weight: 500;
    }

    .image-preview {
      margin-top: 0.75rem;
      border-radius: var(--radius);
      overflow: hidden;
      border: 1px solid var(--border);
      background: var(--bg-primary);
      max-height: 320px;
    }

    .image-preview img {
      display: block;
      max-width: 100%;
      max-height: 320px;
      object-fit: contain;
    }

    .actions {
      margin-top: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }

    .btn.btn-primary {
      padding: 0.55rem 1.4rem;
      border-radius: 999px;
      border: none;
      background: var(--accent);
      color: #050509;
      font-weight: 600;
      font-size: 0.95rem;
      box-shadow: 0 12px 26px rgba(0, 0, 0, 0.35);
      transition: transform 0.1s ease, box-shadow 0.1s ease, filter 0.1s ease;
    }

    .btn.btn-primary:hover:not(:disabled) {
      filter: brightness(1.05);
      transform: translateY(-1px);
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.45);
    }

    .btn.btn-primary:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    }

    .btn.btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      box-shadow: none;
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
export class CreatePostComponent implements OnInit {
  subreddits: SubredditDto[] = [];
  form = this.fb.nonNullable.group({
    subredditId: [null as number | null, Validators.required],
    title: ['', [Validators.required, Validators.maxLength(300)]],
    postType: ['TEXT' as 'TEXT' | 'LINK' | 'IMAGE', Validators.required],
    content: [''],
    linkUrl: [''],
    imageUrl: [''],
  });
  loading = false;
  errorMessage = '';
  subredditLocked = false;
  imageSource: 'url' | 'file' = 'url';
  imageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  imageUploadInProgress = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.api.getSubreddits(undefined, 0, 100).subscribe(res => (this.subreddits = res.content));
  }

  get titleInvalid(): boolean {
    const c = this.form.controls.title;
    return c.invalid && (c.dirty || c.touched);
  }

  setType(type: 'TEXT' | 'LINK' | 'IMAGE') {
    this.form.controls.postType.setValue(type);
  }

  setImageSource(source: 'url' | 'file') {
    this.imageSource = source;
    if (source === 'url') {
      this.imageFile = null;
      this.imagePreviewUrl = null;
    } else {
      this.form.controls.imageUrl.setValue('');
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.imageFile = null;
      this.imagePreviewUrl = null;
      return;
    }
    const file = input.files[0];
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.form.invalid || this.form.getRawValue().subredditId == null) return;
    this.loading = true;
    this.errorMessage = '';
    const v = this.form.getRawValue();

    const createWithImageUrl = (imageUrl?: string) => {
      this.api.createPost({
        subredditId: v.subredditId!,
        title: v.title.trim(),
        postType: v.postType,
        content: v.content || undefined,
        linkUrl: v.postType === 'LINK' ? (v.linkUrl || undefined) : undefined,
        imageUrl: v.postType === 'IMAGE' ? (imageUrl || v.imageUrl || undefined) : undefined,
      }).subscribe({
        next: (post) => {
          this.loading = false;
          this.imageUploadInProgress = false;
          this.router.navigate(['/r', post.subreddit.name, 'post', post.id]);
        },
        error: (err) => {
          this.loading = false;
          this.imageUploadInProgress = false;
          this.errorMessage = err.error?.error || 'Failed to publish.';
        },
      });
    };

    if (v.postType === 'IMAGE' && this.imageSource === 'file' && this.imageFile) {
      this.imageUploadInProgress = true;
      this.api.uploadImage(this.imageFile).subscribe({
        next: (res) => {
          createWithImageUrl(res.url);
        },
        error: (err) => {
          this.loading = false;
          this.imageUploadInProgress = false;
          this.errorMessage = err.error?.error || 'Failed to upload image.';
        },
      });
    } else {
      createWithImageUrl();
    }
  }
}

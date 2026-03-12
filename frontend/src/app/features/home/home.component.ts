import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, PageResponse, PostDto } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PostCardComponent } from '../../shared/post-card/post-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  template: `
    <div class="container">
      <div class="sort-bar">
        <button class="sort-btn" [class.active]="sort === 'hot'" (click)="setSort('hot')">Hot</button>
        <button class="sort-btn" [class.active]="sort === 'new'" (click)="setSort('new')">New</button>
        <button class="sort-btn" [class.active]="sort === 'top'" (click)="setSort('top')">Top</button>
      </div>
      @if (loading) {
        <p class="loading">Loading...</p>
      } @else if (posts.length === 0 && !loading) {
        <p class="empty">No posts yet. Create a community and add the first post!</p>
      } @else {
        <app-post-card
          *ngFor="let p of posts"
          [post]="p"
          [canSave]="auth.isLoggedIn()"
          (voteChange)="onVote(p.id, $event)"
          (saveChange)="onSave(p.id, $event)"
        />
        @if (totalPages > 1) {
          <div class="pagination">
            <button [disabled]="page === 0" (click)="loadPage(page - 1)">Previous</button>
            <span>{{ page + 1 }} / {{ totalPages }}</span>
            <button [disabled]="page >= totalPages - 1" (click)="loadPage(page + 1)">Next</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .sort-bar { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .sort-btn {
      padding: 0.4rem 0.75rem;
      border: 1px solid var(--border);
      background: var(--bg-secondary);
      color: var(--text-secondary);
      border-radius: var(--radius);
      font-size: 0.875rem;
    }
    .sort-btn:hover, .sort-btn.active { background: var(--bg-tertiary); color: var(--text-primary); }
    .loading, .empty { color: var(--text-muted); padding: 2rem; text-align: center; }
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
      padding: 1rem;
    }
    .pagination button {
      padding: 0.5rem 1rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border);
      color: var(--text-primary);
      border-radius: var(--radius);
    }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class HomeComponent implements OnInit {
  posts: PostDto[] = [];
  page = 0;
  size = 20;
  totalPages = 0;
  sort = 'hot';
  loading = false;

  constructor(
    private api: ApiService,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    this.load();
  }

  setSort(s: string) {
    this.sort = s;
    this.page = 0;
    this.load();
  }

  loadPage(p: number) {
    this.page = p;
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getPosts(undefined, this.sort, this.page, this.size).subscribe({
      next: (res: PageResponse<PostDto>) => {
        this.posts = res.content;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  onVote(postId: number, value: number) {
    if (!this.auth.isLoggedIn()) return;
    this.api.votePost(postId, value).subscribe({
      next: () => {
        const p = this.posts.find(x => x.id === postId);
        if (p) {
          const prev = p.userVote || 0;
          p.voteCount += value - prev;
          p.userVote = value === prev ? undefined : value;
        }
      },
    });
  }

  onSave(postId: number, saved: boolean) {
    if (saved) this.api.savePost(postId).subscribe(() => this.updateSaved(postId, true));
    else this.api.unsavePost(postId).subscribe(() => this.updateSaved(postId, false));
  }

  private updateSaved(postId: number, saved: boolean) {
    const p = this.posts.find(x => x.id === postId);
    if (p) p.saved = saved;
  }
}

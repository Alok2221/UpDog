import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, PageResponse, PostDto } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PostCardComponent } from '../../shared/post-card/post-card.component';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  template: `
    <div class="container">
      <h1>Saved posts</h1>
      @if (loading) {
        <p class="loading">Loading...</p>
      } @else if (posts.length === 0) {
        <p class="empty">No saved posts.</p>
      } @else {
        <app-post-card
          *ngFor="let p of posts"
          [post]="p"
          [canSave]="true"
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
    h1 { margin-bottom: 1rem; }
    .loading, .empty { color: var(--text-muted); padding: 2rem; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1rem; }
    .pagination button { padding: 0.5rem 1rem; background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text-primary); border-radius: var(--radius); }
  `],
})
export class SavedComponent implements OnInit {
  posts: PostDto[] = [];
  page = 0;
  totalPages = 0;
  loading = false;

  constructor(
    private api: ApiService,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    this.load();
  }

  loadPage(p: number) {
    this.page = p;
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getSavedPosts(this.page, 20).subscribe({
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
    if (!saved) {
      this.api.unsavePost(postId).subscribe(() => this.posts = this.posts.filter(p => p.id !== postId));
    }
  }
}

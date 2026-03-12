import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, PageResponse, PostDto, SubredditDto } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PostCardComponent } from '../../shared/post-card/post-card.component';

@Component({
  selector: 'app-subreddit',
  standalone: true,
  imports: [CommonModule, PostCardComponent, RouterLink],
  template: `
    <div class="container">
      @if (subreddit) {
        <header class="subreddit-header">
          <div class="subreddit-info">
            @if (subreddit.bannerUrl) {
              <img [src]="subreddit.bannerUrl" alt="" class="banner" />
            }
            <div class="subreddit-meta">
              <h1>r/{{ subreddit.name }}</h1>
              @if (subreddit.description) {
                <p class="description">{{ subreddit.description }}</p>
              }
              <p class="stats">{{ subreddit.subscriberCount }} subscribers</p>
              @if (auth.isLoggedIn()) {
                @if (subreddit.subscribed) {
                  <button type="button" class="btn btn-secondary" (click)="unsubscribe()">Unsubscribe</button>
                } @else {
                  <button type="button" class="btn btn-primary" (click)="subscribe()">Subscribe</button>
                }
              }
            </div>
          </div>
        </header>
        <div class="sort-bar">
          <button class="sort-btn" [class.active]="sort === 'hot'" (click)="setSort('hot')">Hot</button>
          <button class="sort-btn" [class.active]="sort === 'new'" (click)="setSort('new')">New</button>
          <button class="sort-btn" [class.active]="sort === 'top'" (click)="setSort('top')">Top</button>
        </div>
        @if (loading) {
          <p class="loading">Loading...</p>
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
      } @else if (!loadingSub) {
        <p class="error">Community not found.</p>
      }
    </div>
  `,
  styles: [`
    .subreddit-header { margin-bottom: 1.5rem; }
    .banner { width: 100%; max-height: 120px; object-fit: cover; border-radius: var(--radius); }
    .subreddit-meta { padding: 1rem 0; }
    .subreddit-meta h1 { margin: 0 0 0.5rem; font-size: 1.5rem; }
    .description { color: var(--text-secondary); margin: 0 0 0.5rem; }
    .stats { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.75rem; }
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
    .loading, .error { color: var(--text-muted); padding: 2rem; text-align: center; }
    .pagination {
      display: flex; align-items: center; justify-content: center; gap: 1rem;
      margin-top: 1.5rem; padding: 1rem;
    }
    .pagination button {
      padding: 0.5rem 1rem; background: var(--bg-tertiary); border: 1px solid var(--border);
      color: var(--text-primary); border-radius: var(--radius);
    }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class SubredditComponent implements OnInit {
  subreddit: SubredditDto | null = null;
  posts: PostDto[] = [];
  page = 0;
  size = 20;
  totalPages = 0;
  sort = 'hot';
  loading = false;
  loadingSub = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const name = params['name'];
      if (name) {
        this.loadingSub = true;
        this.api.getSubreddit(name).subscribe({
          next: (s) => {
            this.subreddit = s;
            this.loadingSub = false;
            this.load();
          },
          error: () => { this.loadingSub = false; },
        });
      }
    });
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
    if (!this.subreddit) return;
    this.loading = true;
    this.api.getPosts(this.subreddit.id, this.sort, this.page, this.size).subscribe({
      next: (res: PageResponse<PostDto>) => {
        this.posts = res.content;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  subscribe() {
    if (!this.subreddit) return;
    this.api.subscribeSubreddit(this.subreddit.name).subscribe(() => {
      this.subreddit!.subscribed = true;
      this.subreddit!.subscriberCount++;
    });
  }

  unsubscribe() {
    if (!this.subreddit) return;
    this.api.unsubscribeSubreddit(this.subreddit.name).subscribe(() => {
      this.subreddit!.subscribed = false;
      this.subreddit!.subscriberCount--;
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

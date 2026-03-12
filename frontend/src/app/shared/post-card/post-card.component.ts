import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, PostDto } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="post-card">
      <div class="vote-col">
        <button type="button" class="vote-btn" [class.active]="post.userVote === 1" (click)="vote(1)" title="Upvote">
          ▲
        </button>
        <span class="vote-count">{{ post.voteCount }}</span>
        <button type="button" class="vote-btn down" [class.active]="post.userVote === -1" (click)="vote(-1)" title="Downvote">
          ▼
        </button>
      </div>
      <div class="content-col">
        <div class="meta">
          <a [routerLink]="['/r', post.subreddit.name]" class="subreddit">r/{{ post.subreddit.name }}</a>
          <span class="dot">·</span>
          <span class="author">u/{{ post.author.username }}</span>
          <span class="dot">·</span>
          <span class="date">{{ post.createdAt | date:'short' }}</span>
          @if (post.flair) {
            <span class="flair" [style.background-color]="post.flair.backgroundColor || '#333'" [style.color]="post.flair.textColor || '#fff'">
              {{ post.flair.name }}
            </span>
          }
        </div>
        <a [routerLink]="postLink" class="title">{{ post.title }}</a>
        @if (post.content && post.postType === 'TEXT') {
          <p class="content-preview">{{ post.content | slice:0:200 }}{{ post.content.length > 200 ? '...' : '' }}</p>
        }
        @if (post.postType === 'IMAGE' && post.imageUrl) {
          <img [src]="imageSrc" alt="" class="preview-img" />
        }
        @if (post.postType === 'LINK' && post.linkUrl) {
          <a [href]="post.linkUrl" target="_blank" rel="noopener" class="link-url">{{ post.linkUrl }}</a>
        }
        <div class="footer">
          <a [routerLink]="postLink" class="comments">{{ post.commentCount }} comments</a>
          @if (canSave) {
            <button type="button" class="save-btn" (click)="toggleSave()">
              {{ post.saved ? 'Saved' : 'Save' }}
            </button>
          }
        </div>
      </div>
    </article>
  `,
  styles: [`
    .post-card {
      display: flex;
      gap: 0.75rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1rem;
      margin-bottom: 0.75rem;
      box-shadow: var(--shadow);
    }
    .vote-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 40px;
    }
    .vote-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.25rem;
      padding: 0;
      line-height: 1;
    }
    .vote-btn:hover { color: var(--text-primary); }
    .vote-btn.active { color: var(--upvote); }
    .vote-btn.down { }
    .vote-btn.down.active { color: var(--downvote); }
    .vote-count { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); }
    .content-col { flex: 1; min-width: 0; }
    .meta { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .subreddit { color: var(--accent); font-weight: 500; }
    .dot { margin: 0 0.25rem; }
    .flair { font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 4px; margin-left: 0.25rem; }
    .title {
      display: block;
      font-weight: 600;
      color: var(--text-primary);
      text-decoration: none;
      margin-bottom: 0.25rem;
    }
    .title:hover { color: var(--accent); text-decoration: underline; }
    .content-preview { font-size: 0.875rem; color: var(--text-secondary); margin: 0.5rem 0; }
    .preview-img { max-width: 100%; max-height: 300px; border-radius: var(--radius); }
    .link-url { font-size: 0.875rem; color: var(--accent); word-break: break-all; }
    .footer { margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted); }
    .comments { color: var(--text-muted); }
    .save-btn { background: none; border: none; color: var(--text-muted); margin-left: 1rem; padding: 0; }
    .save-btn:hover { color: var(--text-primary); }
    @media (max-width: 600px) {
      .vote-col { min-width: 32px; }
      .vote-count { font-size: 0.7rem; }
    }
  `],
})
export class PostCardComponent {
  @Input() post!: PostDto;
  @Input() canSave = false;
  @Output() voteChange = new EventEmitter<number>();
  @Output() saveChange = new EventEmitter<boolean>();

  get postLink(): string[] {
    return ['/r', this.post.subreddit.name, 'post', String(this.post.id)];
  }

  get imageSrc(): string | null {
    if (!this.post.imageUrl) {
      return null;
    }
    if (this.post.imageUrl.startsWith('/')) {
      const api = environment.apiUrl; // e.g. http://localhost:8080/api
      const base = api.replace(/\/api\/?$/, '');
      return base + this.post.imageUrl;
    }
    return this.post.imageUrl;
  }

  vote(value: number) {
    this.voteChange.emit(value);
  }

  toggleSave() {
    this.saveChange.emit(!this.post.saved);
  }
}

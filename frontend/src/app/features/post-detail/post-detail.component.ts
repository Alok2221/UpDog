import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, CommentDto, PostDto } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CommentNodeComponent } from '../../shared/comment-node/comment-node.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CommentNodeComponent],
  template: `
    <div class="container">
      @if (post) {
        <article class="post-detail">
          <div class="vote-col">
            <button type="button" class="vote-btn" [class.active]="post.userVote === 1" (click)="votePost(1)">▲</button>
            <span class="vote-count">{{ post.voteCount }}</span>
            <button type="button" class="vote-btn down" [class.active]="post.userVote === -1" (click)="votePost(-1)">▼</button>
          </div>
          <div class="content-col">
            <div class="meta">
              <a [routerLink]="['/r', post.subreddit.name]">r/{{ post.subreddit.name }}</a>
              <span class="dot">·</span>
              <span>u/{{ post.author.username }}</span>
              <span class="dot">·</span>
              <span>{{ post.createdAt | date:'medium' }}</span>
            </div>
            <h1 class="title">{{ post.title }}</h1>
            @if (post.content) {
              <div class="content">{{ post.content }}</div>
            }
            @if (post.postType === 'IMAGE' && post.imageUrl) {
              <img [src]="imageSrc" alt="" class="post-img" />
            }
            @if (post.postType === 'LINK' && post.linkUrl) {
              <a [href]="post.linkUrl" target="_blank" rel="noopener">{{ post.linkUrl }}</a>
            }
            <div class="footer">
              {{ post.commentCount }} comments
              @if (auth.isLoggedIn()) {
                <button type="button" (click)="toggleSave()">{{ post.saved ? 'Saved' : 'Save' }}</button>
              }
            </div>
          </div>
        </article>
        @if (auth.isLoggedIn() && !post.locked) {
          <div class="comment-form">
            <textarea [(ngModel)]="newComment" placeholder="Add a comment..." rows="3"></textarea>
            <button type="button" class="btn btn-primary" (click)="submitComment()" [disabled]="!newComment.trim()">
              Submit
            </button>
          </div>
        }
        <div class="comments-section">
          <h2>Comments</h2>
          <app-comment-node
            *ngFor="let c of comments"
            [comment]="c"
            [canVote]="auth.isLoggedIn()"
            (reply)="onReply($event)"
            (voteChange)="onCommentVote($event)"
          />
        </div>
      } @else if (!loading) {
        <p class="error">Post not found.</p>
      }
    </div>
  `,
  styles: [`
    .post-detail { display: flex; gap: 1rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 1rem; }
    .vote-col { display: flex; flex-direction: column; align-items: center; }
    .vote-btn { background: none; border: none; color: var(--text-muted); font-size: 1.5rem; }
    .vote-btn.active { color: var(--upvote); }
    .vote-btn.down { }
    .vote-btn.down.active { color: var(--downvote); }
    .vote-count { font-weight: 600; }
    .content-col { flex: 1; }
    .meta { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem; }
    .title { margin: 0 0 0.75rem; font-size: 1.25rem; }
    .content { white-space: pre-wrap; margin-bottom: 1rem; }
    .post-img { max-width: 100%; border-radius: var(--radius); }
    .footer { margin-top: 1rem; font-size: 0.875rem; color: var(--text-muted); }
    .comment-form { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem; margin-bottom: 1rem; }
    .comment-form textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-secondary); color: var(--text-primary); resize: vertical; }
    .comment-form .btn { margin-top: 0.5rem; }
    .comments-section h2 { font-size: 1rem; margin-bottom: 1rem; }
  `],
})
export class PostDetailComponent implements OnInit {
  post: PostDto | null = null;
  comments: CommentDto[] = [];
  newComment = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getPost(+id).subscribe({
        next: (p) => {
          this.post = p;
          this.loadComments();
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
    } else {
      this.loading = false;
    }
  }

  get imageSrc(): string | null {
    if (!this.post?.imageUrl) {
      return null;
    }
    if (this.post.imageUrl.startsWith('/')) {
      const api = environment.apiUrl;
      const base = api.replace(/\/api\/?$/, '');
      return base + this.post.imageUrl;
    }
    return this.post.imageUrl;
  }

  loadComments() {
    if (!this.post) return;
    this.api.getComments(this.post.id).subscribe(res => (this.comments = res));
  }

  votePost(value: number) {
    if (!this.post || !this.auth.isLoggedIn()) return;
    this.api.votePost(this.post.id, value).subscribe({
      next: () => {
        const prev = this.post!.userVote || 0;
        this.post!.voteCount += value - prev;
        this.post!.userVote = value === prev ? undefined : value;
      },
    });
  }

  toggleSave() {
    if (!this.post) return;
    if (this.post.saved) {
      this.api.unsavePost(this.post.id).subscribe(() => (this.post!.saved = false));
    } else {
      this.api.savePost(this.post.id).subscribe(() => (this.post!.saved = true));
    }
  }

  submitComment() {
    if (!this.post || !this.newComment.trim()) return;
    this.api.createComment(this.post.id, this.newComment.trim()).subscribe({
      next: (c) => {
        this.comments = [...this.comments, c];
        this.post!.commentCount++;
        this.newComment = '';
      },
    });
  }

  onReply(parentId: number) {
    const content = prompt('Reply:');
    if (!content || !this.post) return;
    this.api.createComment(this.post.id, content, parentId).subscribe({
      next: (c) => this.loadComments(),
    });
  }

  onCommentVote(payload: { id: number; value: number }) {
    this.api.voteComment(payload.id, payload.value).subscribe(() => this.loadComments());
  }
}

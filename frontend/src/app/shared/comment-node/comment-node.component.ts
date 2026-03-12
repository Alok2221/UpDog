import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentDto } from '../../core/services/api.service';

@Component({
  selector: 'app-comment-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="comment" [style.margin-left.px]="(comment.depth || 0) * 24">
      <div class="comment-header">
        <span class="author">u/{{ comment.author.username }}</span>
        <span class="date">{{ comment.createdAt | date:'short' }}</span>
      </div>
      <p class="comment-content">{{ comment.content }}</p>
      <div class="comment-actions">
        @if (canVote) {
          <button type="button" class="vote-btn" [class.active]="comment.userVote === 1" (click)="vote(1)">▲</button>
          <span class="vote-count">{{ comment.voteCount }}</span>
          <button type="button" class="vote-btn down" [class.active]="comment.userVote === -1" (click)="vote(-1)">▼</button>
          <button type="button" class="reply-btn" (click)="reply.emit(comment.id)">Reply</button>
        }
      </div>
      @if (comment.replies.length) {
        <app-comment-node
          *ngFor="let r of comment.replies"
          [comment]="r"
          [canVote]="canVote"
          (reply)="reply.emit($event)"
          (voteChange)="voteChange.emit($event)"
        />
      }
    </div>
  `,
  styles: [`
    .comment { margin-bottom: 0.75rem; padding: 0.5rem 0; border-left: 2px solid var(--border); padding-left: 0.75rem; }
    .comment-header { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .author { font-weight: 500; color: var(--text-secondary); }
    .date { margin-left: 0.5rem; }
    .comment-content { margin: 0 0 0.25rem; font-size: 0.9rem; white-space: pre-wrap; }
    .comment-actions { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; }
    .vote-btn { background: none; border: none; color: var(--text-muted); padding: 0; }
    .vote-btn.active { color: var(--upvote); }
    .vote-btn.down { }
    .vote-btn.down.active { color: var(--downvote); }
    .reply-btn { background: none; border: none; color: var(--text-muted); padding: 0; }
    .reply-btn:hover { color: var(--accent); }
  `],
})
export class CommentNodeComponent {
  @Input() comment!: CommentDto;
  @Input() canVote = false;
  @Output() reply = new EventEmitter<number>();
  @Output() voteChange = new EventEmitter<{ id: number; value: number }>();

  vote(value: number) {
    this.voteChange.emit({ id: this.comment.id, value });
  }
}


import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserDto {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  karma: number;
  createdAt: string;
  enabled: boolean;
}

export interface SubredditDto {
  id: number;
  name: string;
  description?: string;
  sidebar?: string;
  bannerUrl?: string;
  iconUrl?: string;
  owner?: UserDto;
  createdAt: string;
  isPrivate: boolean;
  subscriberCount: number;
  subscribed: boolean;
  isModerator: boolean;
  rules?: { id: number; sortOrder: number; title: string; description?: string }[];
  flairs?: { id: number; name: string; backgroundColor?: string; textColor?: string }[];
}

export interface PostDto {
  id: number;
  title: string;
  content?: string;
  postType: 'TEXT' | 'LINK' | 'IMAGE';
  linkUrl?: string;
  imageUrl?: string;
  author: UserDto;
  subreddit: SubredditDto;
  flair?: { id: number; name: string; backgroundColor?: string; textColor?: string };
  voteCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
  locked: boolean;
  removed: boolean;
  userVote?: number;
  saved?: boolean;
}

export interface CommentDto {
  id: number;
  content: string;
  author: UserDto;
  postId: number;
  parentId?: number;
  voteCount: number;
  createdAt: string;
  updatedAt?: string;
  removed: boolean;
  depth: number;
  userVote?: number;
  replies: CommentDto[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Auth
  login(username: string, password: string) {
    return this.http.post<any>(`${this.api}/auth/login`, { username, password });
  }

  register(username: string, email: string, password: string) {
    return this.http.post<{ message: string }>(`${this.api}/auth/register`, { username, email, password });
  }

  activate(code: string) {
    return this.http.post<{ message: string }>(`${this.api}/auth/activate`, null, { params: { code } });
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(`${this.api}/auth/forgot-password`, null, { params: { email } });
  }

  resetPassword(code: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${this.api}/auth/reset-password`, { code, newPassword });
  }

  refreshToken(refreshToken: string) {
    return this.http.post<any>(`${this.api}/auth/refresh`, { refreshToken });
  }

  // User
  me() {
    return this.http.get<UserDto>(`${this.api}/users/me`);
  }

  // Subreddits
  getSubreddits(search?: string, page = 0, size = 20): Observable<PageResponse<SubredditDto>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<PageResponse<SubredditDto>>(`${this.api}/subreddits`, { params });
  }

  getSubreddit(name: string) {
    return this.http.get<SubredditDto>(`${this.api}/subreddits/${encodeURIComponent(name)}`);
  }

  createSubreddit(body: { name: string; description?: string; sidebar?: string; isPrivate?: boolean }) {
    return this.http.post<SubredditDto>(`${this.api}/subreddits`, body);
  }

  subscribeSubreddit(name: string) {
    return this.http.post<void>(`${this.api}/subreddits/${encodeURIComponent(name)}/subscribe`, {});
  }

  unsubscribeSubreddit(name: string) {
    return this.http.post<void>(`${this.api}/subreddits/${encodeURIComponent(name)}/unsubscribe`, {});
  }

  // Posts
  getPosts(subredditId?: number, sort = 'hot', page = 0, size = 20) {
    let params = new HttpParams().set('sort', sort).set('page', page).set('size', size);
    if (subredditId != null) params = params.set('subredditId', subredditId);
    return this.http.get<PageResponse<PostDto>>(`${this.api}/posts`, { params });
  }

  getFeed(page = 0, size = 20) {
    return this.http.get<PageResponse<PostDto>>(`${this.api}/posts/feed`, {
      params: { page, size },
    });
  }

  getPost(id: number) {
    return this.http.get<PostDto>(`${this.api}/posts/${id}`);
  }

  searchPosts(q: string, page = 0, size = 20) {
    return this.http.get<PageResponse<PostDto>>(`${this.api}/posts/search`, {
      params: { q: q || '', page, size },
    });
  }

  getSavedPosts(page = 0, size = 20) {
    return this.http.get<PageResponse<PostDto>>(`${this.api}/posts/saved`, { params: { page, size } });
  }

  createPost(body: {
    title: string;
    content?: string;
    postType: 'TEXT' | 'LINK' | 'IMAGE';
    linkUrl?: string;
    imageUrl?: string;
    flairId?: number;
    subredditId: number;
  }) {
    return this.http.post<PostDto>(`${this.api}/posts`, body);
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.api}/uploads/image`, formData);
  }

  savePost(id: number) {
    return this.http.post<void>(`${this.api}/posts/${id}/save`, {});
  }

  unsavePost(id: number) {
    return this.http.delete<void>(`${this.api}/posts/${id}/save`);
  }

  // Comments
  getComments(postId: number) {
    return this.http.get<CommentDto[]>(`${this.api}/comments/post/${postId}`);
  }

  createComment(postId: number, content: string, parentId?: number) {
    return this.http.post<CommentDto>(`${this.api}/comments`, { postId, content, parentId });
  }

  // Votes
  votePost(postId: number, value: number) {
    return this.http.post<void>(`${this.api}/votes/post/${postId}`, null, {
      params: { value: value.toString() },
    });
  }

  voteComment(commentId: number, value: number) {
    return this.http.post<void>(`${this.api}/votes/comment/${commentId}`, null, {
      params: { value: value.toString() },
    });
  }
}

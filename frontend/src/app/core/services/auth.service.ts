import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  karma: number;
  createdAt: string;
  enabled: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}`;
  private accessToken = signal<string | null>(this.getStoredToken());
  private refreshToken = signal<string | null>(this.getStoredRefreshToken());
  private currentUser = signal<User | null>(this.getStoredUser());

  isLoggedIn = computed(() => !!this.accessToken());
  user = computed(() => this.currentUser());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.restoreUserFromStorage();
  }

  login(username: string, password: string) {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, { username, password }).pipe(
      tap((res) => this.handleAuthResponse(res)),
    );
  }

  register(username: string, email: string, password: string) {
    return this.http.post<{ message: string }>(`${this.api}/auth/register`, {
      username,
      email,
      password,
    });
  }

  activate(code: string) {
    return this.http.post<{ message: string }>(`${this.api}/auth/activate`, null, {
      params: { code },
    });
  }

  /** Dev / fallback: get activation code by email when link was not received. */
  getDevActivationCode(email: string) {
    return this.http.get<{ code: string; link: string }>(`${this.api}/dev/activation-code`, {
      params: { email },
    });
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(`${this.api}/auth/forgot-password`, null, {
      params: { email },
    });
  }

  resetPassword(code: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${this.api}/auth/reset-password`, {
      code,
      newPassword,
    });
  }

  refreshTokenRequest() {
    const refresh = this.refreshToken();
    if (!refresh) return of(null);
    return this.http.post<AuthResponse>(`${this.api}/auth/refresh`, { refreshToken: refresh }).pipe(
      tap((res) => this.handleAuthResponse(res)),
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }

  logout() {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  private handleAuthResponse(res: AuthResponse) {
    this.accessToken.set(res.accessToken);
    this.refreshToken.set(res.refreshToken);
    this.currentUser.set(res.user);
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private getStoredUser(): User | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  private restoreUserFromStorage() {
    const t = this.getStoredToken();
    const u = this.getStoredUser();
    if (t && u) {
      this.accessToken.set(t);
      this.currentUser.set(u);
    }
  }
}

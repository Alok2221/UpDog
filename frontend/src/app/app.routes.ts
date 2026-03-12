import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'activate', loadComponent: () => import('./features/auth/activate/activate.component').then(m => m.ActivateComponent) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'r/:name', loadComponent: () => import('./features/subreddit/subreddit.component').then(m => m.SubredditComponent) },
  { path: 'r/:name/post/:id', loadComponent: () => import('./features/post-detail/post-detail.component').then(m => m.PostDetailComponent) },
  { path: 'post/:id', loadComponent: () => import('./features/post-detail/post-detail.component').then(m => m.PostDetailComponent) },
  { path: 'create-post', loadComponent: () => import('./features/create-post/create-post.component').then(m => m.CreatePostComponent), canActivate: [authGuard] },
  { path: 'create-subreddit', loadComponent: () => import('./features/create-subreddit/create-subreddit.component').then(m => m.CreateSubredditComponent), canActivate: [authGuard] },
  { path: 'saved', loadComponent: () => import('./features/saved/saved.component').then(m => m.SavedComponent), canActivate: [authGuard] },
  { path: 'feed', loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent), canActivate: [authGuard] },
  { path: 'search', loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent) },
  { path: '**', redirectTo: '' },
];

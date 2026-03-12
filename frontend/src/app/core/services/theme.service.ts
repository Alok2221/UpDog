import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'updog-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly darkSignal = signal<boolean>(this.loadInitial());
  isDark = computed(() => this.darkSignal());

  private loadInitial(): boolean {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  setTheme(theme: Theme) {
    const isDark = theme === 'dark';
    this.darkSignal.set(isDark);
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.classList.toggle('theme-dark', isDark);
    document.documentElement.classList.toggle('theme-light', !isDark);
  }

  toggle() {
    this.setTheme(this.darkSignal() ? 'light' : 'dark');
  }

  init() {
    this.setTheme(this.darkSignal() ? 'dark' : 'light');
  }
}

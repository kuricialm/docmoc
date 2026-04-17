import { createContext } from 'react';

export type AppTheme = 'light' | 'dark';

export type ThemeContextValue = {
  theme: AppTheme;
  resolvedTheme: AppTheme;
  setTheme: (theme: AppTheme) => void;
};

export const THEME_STORAGE_KEY = 'docmoc-theme';
export const DEFAULT_THEME: AppTheme = 'light';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const normalizeTheme = (value: string | null | undefined): AppTheme =>
  value === 'dark' ? 'dark' : DEFAULT_THEME;

export const applyTheme = (theme: AppTheme) => {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
};

export const createThemeTransition = () => {
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(`
    *, *::before, *::after {
      transition-property: background-color, border-color, color, fill, stroke, box-shadow !important;
      transition-duration: 160ms !important;
      transition-timing-function: ease !important;
      animation: none !important;
    }
  `));
  document.head.appendChild(style);

  return () => {
    window.setTimeout(() => {
      requestAnimationFrame(() => {
        style.remove();
      });
    }, 200);
  };
};

export const readInitialTheme = (): AppTheme => {
  if (typeof document !== 'undefined') {
    const rootTheme = document.documentElement.dataset.theme;
    if (rootTheme === 'light' || rootTheme === 'dark') return rootTheme;
  }

  if (typeof window === 'undefined') return DEFAULT_THEME;
  return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
};

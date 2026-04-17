import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ThemeContext,
  type ThemeContextValue,
  type AppTheme,
  THEME_STORAGE_KEY,
  normalizeTheme,
  applyTheme,
  readInitialTheme,
  createThemeTransition,
} from '@/lib/theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(readInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const nextTheme = normalizeTheme(event.newValue);
      applyTheme(nextTheme);
      setThemeState(nextTheme);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    resolvedTheme: theme,
    setTheme: (nextTheme: AppTheme) => {
      const restoreTransitions = createThemeTransition();
      applyTheme(nextTheme);
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      setThemeState(nextTheme);
      restoreTransitions();
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

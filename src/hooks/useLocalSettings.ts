import { useState, useCallback, useEffect } from 'react';

const SETTINGS_KEY = 'docmoc-local-settings';

type LocalSettings = {
  thumbnailPreviews: boolean;
};

const defaults: LocalSettings = {
  thumbnailPreviews: true,
};

function read(): LocalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function write(s: LocalSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function useLocalSettings() {
  const [settings, setSettings] = useState<LocalSettings>(read);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === SETTINGS_KEY) setSettings(read());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const update = useCallback((patch: Partial<LocalSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      write(next);
      return next;
    });
  }, []);

  return { settings, update };
}

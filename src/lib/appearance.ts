const STORAGE_KEY = 'appearance-settings';
export const APPEARANCE_CHANGE_EVENT = 'appearancechange';

export type AccentTone = 'brown' | 'blue' | 'green' | 'purple' | 'teal' | 'rose';
export type SurfaceMode = 'warm' | 'paper' | 'contrast';
export type ThemeMode = 'light' | 'dark';

export interface AppearanceSettings {
  accentTone: AccentTone;
  surfaceMode: SurfaceMode;
  themeMode: ThemeMode;
}

export const defaultAppearanceSettings: AppearanceSettings = {
  accentTone: 'brown',
  surfaceMode: 'warm',
  themeMode: 'light',
};

export const getAppearanceSettings = (): AppearanceSettings => {
  if (typeof window === 'undefined') {
    return defaultAppearanceSettings;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return defaultAppearanceSettings;
  }

  try {
    return {
      ...defaultAppearanceSettings,
      ...JSON.parse(stored),
    };
  } catch {
    return defaultAppearanceSettings;
  }
};

export const applyAppearanceSettings = (settings: AppearanceSettings) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.dataset.accentTone = settings.accentTone;
  root.dataset.surfaceMode = settings.surfaceMode;
  root.dataset.themeMode = settings.themeMode;
};

export const saveAppearanceSettings = (settings: AppearanceSettings) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent(APPEARANCE_CHANGE_EVENT, { detail: settings }));
  }

  applyAppearanceSettings(settings);
};

const STORAGE_KEY = 'appearance-settings';
export const APPEARANCE_CHANGE_EVENT = 'appearancechange';

export type AccentTone = 'brown' | 'blue' | 'green' | 'purple' | 'teal' | 'rose';
export type SurfaceMode = 'warm' | 'paper' | 'contrast';
export type ThemeMode = 'light' | 'dark';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type FontStyle = 'sans' | 'serif' | 'mono' | 'display';
export type UiZoom = '80%' | '90%' | '100%' | '110%' | '120%' | '130%' | '140%' | '150%';

export interface AppearanceSettings {
  accentTone: AccentTone;
  surfaceMode: SurfaceMode;
  themeMode: ThemeMode;
  fontSize?: FontSize;
  fontStyle?: FontStyle;
  uiZoom?: UiZoom;
}

export const defaultAppearanceSettings: AppearanceSettings = {
  accentTone: 'brown',
  surfaceMode: 'warm',
  themeMode: 'light',
  fontSize: 'base',
  fontStyle: 'sans',
  uiZoom: '100%',
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

  const fontStyle = settings.fontStyle || 'sans';
  const fontSize = settings.fontSize || 'base';
  const uiZoom = settings.uiZoom || '100%';

  root.dataset.fontStyle = fontStyle;
  root.dataset.fontSize = fontSize;
  root.dataset.uiZoom = uiZoom;

  // Calculate size factor
  let sizeFactor = 1.0;
  if (fontSize === 'sm') sizeFactor = 0.875;
  else if (fontSize === 'lg') sizeFactor = 1.125;
  else if (fontSize === 'xl') sizeFactor = 1.25;

  // Calculate zoom factor
  let zoomFactor = 1.0;
  const pct = parseInt(uiZoom.replace('%', ''), 10);
  if (!isNaN(pct)) {
    zoomFactor = pct / 100;
  }

  root.style.setProperty('--app-font-size-factor', sizeFactor.toString());
  root.style.setProperty('--app-zoom-factor', zoomFactor.toString());
};

export const saveAppearanceSettings = (settings: AppearanceSettings) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent(APPEARANCE_CHANGE_EVENT, { detail: settings }));
  }

  applyAppearanceSettings(settings);
};

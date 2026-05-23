import { useEffect, useState, type ButtonHTMLAttributes } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import {
  APPEARANCE_CHANGE_EVENT,
  getAppearanceSettings,
  saveAppearanceSettings,
  type AppearanceSettings,
} from '../lib/appearance';

type PublicThemeToggleProps = {
  className?: string;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

export const PublicThemeToggle = ({ className, type = 'button' }: PublicThemeToggleProps) => {
  const [currentSettings, setCurrentSettings] = useState<AppearanceSettings>(getAppearanceSettings());
  const isDark = currentSettings.themeMode === 'dark';

  useEffect(() => {
    const syncAppearance = () => {
      setCurrentSettings(getAppearanceSettings());
    };

    const handleAppearanceChange = (event: Event) => {
      const customEvent = event as CustomEvent<AppearanceSettings>;
      setCurrentSettings(customEvent.detail || getAppearanceSettings());
    };

    window.addEventListener('storage', syncAppearance);
    window.addEventListener(APPEARANCE_CHANGE_EVENT, handleAppearanceChange as EventListener);

    return () => {
      window.removeEventListener('storage', syncAppearance);
      window.removeEventListener(APPEARANCE_CHANGE_EVENT, handleAppearanceChange as EventListener);
    };
  }, []);

  const toggleTheme = () => {
    saveAppearanceSettings({
      ...currentSettings,
      themeMode: isDark ? 'light' : 'dark',
    });
  };

  return (
    <button
      type={type}
      onClick={toggleTheme}
      className={className ?? 'app-btn-secondary inline-flex items-center gap-2 shadow-md'}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

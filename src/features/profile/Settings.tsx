import { useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import {
  AdjustmentsHorizontalIcon,
  SwatchIcon,
  MoonIcon,
  SunIcon,
  LockClosedIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';
import {
  saveAppearanceSettings,
  getAppearanceSettings,
  type AppearanceSettings,
  defaultAppearanceSettings,
} from '../../lib/appearance';
import { AxiosError } from 'axios';
import { PasswordStrengthIndicator } from '../../components/PasswordStrengthIndicator';

export const Settings = () => {
  const { t } = useLanguage();
  const [success, setSuccess] = useState('');

  const [appearance, setAppearance] = useState<AppearanceSettings>(() => getAppearanceSettings());

  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1, t('currentPasswordRequired') || 'Current password is required'),
      newPassword: z.string().min(6, t('atLeast6Chars') || 'Password must be at least 6 characters'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('passwordsDontMatch') || 'Passwords do not match',
      path: ['confirmPassword'],
    });

  type PasswordFormData = z.infer<typeof passwordSchema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: PasswordFormData) => apiClient.put('/users/change-password', data),
    onSuccess: () => {
      setSuccess(t('passwordChangedSuccess') || 'Password changed successfully');
      reset();
    },
    onError: (err: AxiosError<{ error?: string }>) => {
      setSuccess('');
      window.alert(err.response?.data?.error || t('failedToUpdatePassword') || 'Failed to update password');
    },
  });

  const updateAppearance = (nextSettings: AppearanceSettings) => {
    setAppearance(nextSettings);
    saveAppearanceSettings(nextSettings);
  };

  // Pre‑translate strings for child components
  const passwordPlaceholder = t('passwordPlaceholder') || '••••••••';

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Settings Hero Header */}
      <div
        className="relative overflow-hidden rounded-[40px] p-10 shadow-2xl"
        style={{ background: 'var(--app-panel)', color: 'var(--app-text)' }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-[var(--app-panel-soft)] backdrop-blur-md rounded-3xl border border-[var(--app-border)]">
              <AdjustmentsHorizontalIcon className="h-10 w-10 text-[var(--app-accent)]" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight mb-2">
                {t('settings') || 'Settings'}
              </h1>
              <p className="text-lg max-w-xl leading-relaxed" style={{ color: 'var(--app-muted)' }}>
                {t('settingsDescription') || 'Customize your dashboard appearance and security preferences'}
              </p>
            </div>
          </div>
        </div>

        {/* Abstract background patterns */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 [background-image:radial-gradient(at_0%_0%,var(--app-accent-soft)_0px,transparent_50%),radial-gradient(at_100%_0%,var(--app-accent-soft)_0px,transparent_50%)] opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-64 h-64 bg-[var(--app-accent)] opacity-10 rounded-full blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Appearance Section */}
          <div className="app-card">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-display flex items-center">
                <SwatchIcon className="h-6 w-6 mr-3 text-[var(--app-accent)]" />
                {t('appearance') || 'Appearance'}
              </h2>
              <button
                onClick={() => updateAppearance(defaultAppearanceSettings)}
                className="text-xs font-black uppercase tracking-widest text-[var(--app-muted)] hover:text-[var(--app-accent)] transition-colors"
              >
                {t('resetToDefault') || 'Reset to default'}
              </button>
            </div>

            <div className="space-y-10">
              <SettingGroup
                title={t('themeMode') || 'Theme mode'}
                description={t('themeDescription') || 'Choose between light and dark interface'}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ThemeOption
                    label={t('lightMode') || 'Light'}
                    active={appearance.themeMode === 'light'}
                    onClick={() => updateAppearance({ ...appearance, themeMode: 'light' })}
                    icon={SunIcon}
                    preview="bg-stone-50 border-stone-200"
                  />
                  <ThemeOption
                    label={t('darkMode') || 'Dark'}
                    active={appearance.themeMode === 'dark'}
                    onClick={() => updateAppearance({ ...appearance, themeMode: 'dark' })}
                    icon={MoonIcon}
                    preview="bg-stone-900 border-stone-800"
                  />
                </div>
              </SettingGroup>

              <SettingGroup
                title={t('accentTone') || 'Accent color'}
                description={t('accentDescription') || 'Choose a primary accent for buttons and highlights'}
              >
                <div className="flex flex-wrap gap-6">
                  <AccentCircle
                    color="#8b5e3c"
                    active={appearance.accentTone === 'brown'}
                    onClick={() => updateAppearance({ ...appearance, accentTone: 'brown' })}
                    label={t('courtBrown') || 'Brown'}
                  />
                  <AccentCircle
                    color="#3b82f6"
                    active={appearance.accentTone === 'blue'}
                    onClick={() => updateAppearance({ ...appearance, accentTone: 'blue' })}
                    label={t('civicBlue') || 'Blue'}
                  />
                  <AccentCircle
                    color="#10b981"
                    active={appearance.accentTone === 'green'}
                    onClick={() => updateAppearance({ ...appearance, accentTone: 'green' })}
                    label={t('benchGreen') || 'Green'}
                  />
                  <AccentCircle
                    color="#8b5cf6"
                    active={appearance.accentTone === 'purple'}
                    onClick={() => updateAppearance({ ...appearance, accentTone: 'purple' })}
                    label={t('royalPurple') || 'Purple'}
                  />
                  <AccentCircle
                    color="#14b8a6"
                    active={appearance.accentTone === 'teal'}
                    onClick={() => updateAppearance({ ...appearance, accentTone: 'teal' })}
                    label={t('oceanTeal') || 'Teal'}
                  />
                  <AccentCircle
                    color="#f43f5e"
                    active={appearance.accentTone === 'rose'}
                    onClick={() => updateAppearance({ ...appearance, accentTone: 'rose' })}
                    label={t('roseRed') || 'Rose'}
                  />
                </div>
              </SettingGroup>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Security Section */}
          <div className="app-card">
            <h2 className="text-xl font-bold font-display mb-6 flex items-center">
              <LockClosedIcon className="h-6 w-6 mr-3 text-red-500" />
              {t('security') || 'Security'}
            </h2>

            {success && (
              <div className="mb-6 p-4 rounded-2xl bg-green-500/10 text-green-600 text-xs font-bold border border-green-500/20 animate-fade-in">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
              <PasswordField
                label={t('currentPassword') || 'Current password'}
                registration={register('currentPassword')}
                error={errors.currentPassword?.message}
                placeholder={passwordPlaceholder}
              />
              <PasswordField
                label={t('newPassword') || 'New password'}
                registration={register('newPassword')}
                error={errors.newPassword?.message}
                passwordValue={watch('newPassword')}
                placeholder={passwordPlaceholder}
              />
              <PasswordField
                label={t('confirmNewPassword') || 'Confirm new password'}
                registration={register('confirmPassword')}
                error={errors.confirmPassword?.message}
                placeholder={passwordPlaceholder}
              />

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50"
                style={{
                  background: 'var(--app-accent)',
                  color: 'white',
                }}
              >
                {mutation.isPending ? (t('updating') || 'Updating...') : (t('updatePassword') || 'Update password')}
              </button>
            </form>
          </div>

          <div className="app-card border border-[var(--app-accent-soft)] bg-[var(--app-accent-soft)]/50 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 text-[var(--app-accent)] opacity-10">
              <LightBulbIcon className="w-32 h-32" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--app-accent)] mb-5 flex items-center gap-2">
              <LightBulbIcon className="w-5 h-5" />
              {t('quickGuidance') || 'Quick guidance'}
            </h3>
            <ul className="space-y-4 relative z-10">
              <li className="text-xs text-[var(--app-text)] opacity-80 leading-relaxed flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--app-accent)] mt-1.5 shrink-0" />
                <span>{t('guidance1') || 'Use a strong, unique password for your account'}</span>
              </li>
              <li className="text-xs text-[var(--app-text)] opacity-80 leading-relaxed flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--app-accent)] mt-1.5 shrink-0" />
                <span>{t('guidance2') || 'Enable dark mode for reduced eye strain at night'}</span>
              </li>
              <li className="text-xs text-[var(--app-text)] opacity-80 leading-relaxed flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--app-accent)] mt-1.5 shrink-0" />
                <span>{t('guidance3') || 'Keep your email address up to date for notifications'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingGroup = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg font-bold text-[var(--app-text)]">{title}</h3>
      <p className="text-xs text-[var(--app-muted)] mt-1">{description}</p>
    </div>
    {children}
  </div>
);

const ThemeOption = ({ label, active, onClick, icon: Icon, preview }: any) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-3xl border-2 transition-all text-left flex items-center justify-between group ${
      active ? 'border-[var(--app-accent)] bg-[var(--app-accent-soft)]' : 'border-[var(--app-border)] hover:border-stone-400'
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-xl ${
          active ? 'bg-[var(--app-accent)] text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className={`text-sm font-bold ${active ? 'text-[var(--app-text)]' : 'text-[var(--app-muted)]'}`}>
        {label}
      </span>
    </div>
    <div className={`w-10 h-6 rounded-lg border shadow-inner ${preview}`}></div>
  </button>
);

const AccentCircle = ({ color, active, onClick, label }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group">
    <div
      className={`w-10 h-10 rounded-full border-4 transition-all shadow-md group-hover:scale-110 ${
        active ? 'border-[var(--app-text)]' : 'border-transparent'
      }`}
      style={{ backgroundColor: color }}
    />
    <span
      className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${
        active ? 'text-[var(--app-text)]' : 'text-[var(--app-muted)]'
      }`}
    >
      {label}
    </span>
  </button>
);

const PasswordField = ({ label, registration, error, passwordValue, placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] ml-1">
      {label}
    </label>
    <div className="relative">
      <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--app-muted)]" />
      <input
        type="password"
        {...registration}
        className="app-input pl-11 py-3 text-sm"
        placeholder={placeholder}
      />
    </div>
    {passwordValue !== undefined && <PasswordStrengthIndicator password={passwordValue} />}
    {error && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{error}</p>}
  </div>
);
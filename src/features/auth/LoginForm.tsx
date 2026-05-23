import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ScaleIcon, KeyIcon, UserIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { useLanguage } from '../../i18n';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const { t, toggleLanguage, language } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const loginSchema = z.object({
    identifier: z.string().min(3, t('usernameRequired')),
    password: z.string().min(6, t('passwordMin6')),
    rememberMe: z.boolean().optional(),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.identifier, data.password, data.rememberMe);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const axErr = err as import('axios').AxiosError<{ message?: string; requiresVerification?: boolean; email?: string }>;
      if (axErr.response?.data?.requiresVerification && axErr.response.data.email) {
        navigate(`/verify-email?email=${encodeURIComponent(axErr.response.data.email)}`);
      } else {
        setError(axErr.response?.data?.message || t('somethingWentWrong'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--app-bg)] px-4 py-10">
      <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-[var(--app-accent)] opacity-10 blur-[120px]" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[var(--app-accent-soft)] opacity-20 blur-[120px]" />

      <div className="absolute left-6 top-6 z-20 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-panel-soft)] px-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--app-accent-soft)] hover:text-[var(--app-accent)]"
          title={t('home')}
        >
          <HomeIcon className="h-4 w-4" strokeWidth={2} />
          <span className="hidden sm:inline">{t('home')}</span>
        </Link>

        <button
          type="button"
          onClick={toggleLanguage}
          className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-panel-soft)] px-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--app-accent-soft)] hover:text-[var(--app-accent)]"
        >
          {language === 'en' ? 'አማርኛ' : 'EN'}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[520px] animate-fade-in">
        <div className="app-auth-shell relative">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link
              to="/"
              className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-[28px] bg-[var(--app-accent)] text-white shadow-xl transition hover:-translate-y-0.5 hover:scale-[1.03]"
            >
              <ScaleIcon className="h-10 w-10" />
            </Link>
            <h1 className="app-heading text-3xl font-black leading-tight sm:text-4xl">
              {t('welcomeBackTitle')}
            </h1>
            <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-[var(--app-muted)] sm:text-base">
              {t('signInSubtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-600">
              <div className="flex items-start justify-between gap-3">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-lg font-black leading-none text-red-600/70 transition hover:text-red-600"
                  aria-label="Dismiss error"
                >
                  &times;
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="app-label">{t('usernameOrEmail')}</label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--app-muted)] transition-colors group-focus-within:text-[var(--app-accent)]">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder={t('usernameOrEmail')}
                  {...register('identifier')}
                  className="app-input pl-12"
                  autoComplete="username"
                />
              </div>
              {errors.identifier && <p className="app-error">{errors.identifier.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="app-label">{t('password')}</label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--app-muted)] transition-colors group-focus-within:text-[var(--app-accent)]">
                  <KeyIcon className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  {...register('password')}
                  className="app-input pl-12"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && <p className="app-error">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between gap-4 px-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded-md border-[var(--app-border)] text-[var(--app-accent)] focus:ring-[var(--app-accent-soft)]"
                />
                <span className="text-xs font-bold text-[var(--app-muted)] transition-colors hover:text-[var(--app-text)]">
                  {t('rememberMe')}
                </span>
              </label>

              <Link to="/forgot-password" className="app-link text-xs font-black uppercase tracking-[0.2em]">
                {t('forgotPasswordTitle')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="app-btn-primary flex w-full items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                t('signIn')
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-[var(--app-border)] pt-6 text-center">
            <p className="text-sm font-medium text-[var(--app-muted)]">
              {t('dontHaveAccount')}{' '}
              <Link to="/register" className="app-link ml-1 hover:underline">
                {t('registerHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-6 z-0 w-full text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--app-muted)] opacity-40">
          &copy; 2026 {t('appName')}
        </p>
      </div>
    </div>
  );
};

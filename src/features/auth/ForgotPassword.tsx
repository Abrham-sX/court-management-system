import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ScaleIcon } from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPassword = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email: data.email,
      });
      setMessage(response.data.message || t('sendResetLink'));
    } catch (err: unknown) {
      const axErr = err as import('axios').AxiosError<{ message?: string }>;
      setError(axErr.response?.data?.message || t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--app-bg)] px-4 py-10">
      <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-[var(--app-accent)] opacity-10 blur-[120px]" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[var(--app-accent-soft)] opacity-20 blur-[120px]" />

      <div className="w-full max-w-[480px] animate-fade-in">
        <div className="app-auth-shell">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link
              to="/"
              className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-[28px] bg-[var(--app-accent)] text-white shadow-xl transition hover:-translate-y-0.5 hover:scale-[1.03]"
            >
              <ScaleIcon className="h-10 w-10" />
            </Link>
            <h1 className="app-heading text-3xl font-black leading-tight sm:text-4xl">
              {t('forgotPasswordTitle')}
            </h1>
            <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-[var(--app-muted)] sm:text-base">
              {t('forgotPasswordSubtitle')}
            </p>
          </div>

          {message ? (
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm font-semibold text-green-700">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="app-label">{t('email')}</label>
                <input
                  type="email"
                  placeholder={t('enterEmail')}
                  {...register('email')}
                  className="app-input"
                  autoComplete="email"
                />
                {errors.email && <p className="app-error">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="app-btn-primary flex w-full items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? t('sending') : t('sendResetLink')}
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-[var(--app-border)] pt-6 text-center">
            <Link to="/login" className="app-link text-sm font-black uppercase tracking-[0.2em]">
              {t('backToLogin')}
            </Link>
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

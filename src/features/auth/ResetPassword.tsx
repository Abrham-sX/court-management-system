import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ScaleIcon } from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { PasswordStrengthIndicator } from '../../components/PasswordStrengthIndicator';
import { useLanguage } from '../../i18n';

const resetSchema = z
  .object({
    password: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.put(`/auth/reset-password/${token}`, {
        password: data.password,
      });
      setMessage(response.data.message || t('passwordResetSuccess'));
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      const axiosError = err as import('axios').AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || t('somethingWentWrong'));
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
              {t('resetPasswordTitle')}
            </h1>
            <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-[var(--app-muted)] sm:text-base">
              {t('resetPasswordSubtitle')}
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
                <label className="app-label">{t('newPassword')}</label>
                <input
                  type="password"
                  placeholder={t('enterNewPassword')}
                  {...register('password')}
                  className="app-input"
                  autoComplete="new-password"
                />
                <PasswordStrengthIndicator password={watch('password')} />
                {errors.password && <p className="app-error">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="app-label">{t('confirmPassword')}</label>
                <input
                  type="password"
                  placeholder={t('confirmNewPassword')}
                  {...register('confirmPassword')}
                  className="app-input"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <p className="app-error">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="app-btn-primary flex w-full items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? t('updatingPassword') : t('updatePassword')}
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

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ScaleIcon, UserIcon, EnvelopeIcon, IdentificationIcon, KeyIcon } from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';
import { PasswordStrengthIndicator } from '../../components/PasswordStrengthIndicator';

const accountTypes = ['User', 'Lawyer'] as const;

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { t, toggleLanguage, language } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ========== Zod Schema with Unicode letter support ==========
  const registerSchema = z
    .object({
      fullName: z.string()
        .min(3, t('fullNameMin3'))
        .regex(/^[\p{L}\s]+$/u, t('fullNameNoNumbers') || 'Full name must contain only letters and spaces'),
      email: z.string().email(t('invalidEmail')),
      accountType: z
        .string()
        .min(1, t('selectRoleError'))
        .refine((val) => accountTypes.includes(val as typeof accountTypes[number]), {
          message: t('selectRoleError'),
        }),
      username: z.string().min(3, t('usernameRequired')),
      password: z.string().min(1, t('passwordRequired')),
      confirmPassword: z.string().min(1, t('passwordRequired')),
      lawyerIdNumber: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordsDontMatch'),
      path: ['confirmPassword'],
    })
    .refine(
      (data) => {
        if (data.accountType === 'Lawyer') {
          return !!data.lawyerIdNumber && data.lawyerIdNumber.trim().length > 0;
        }
        return true;
      },
      {
        message: t('lawyerIdRequired'),
        path: ['lawyerIdNumber'],
      }
    );

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const selectedAccountType = watch('accountType');

  // Real-time input sanitizer: removes anything that is not a letter (any language) or space
  const handleNameInput = (e: React.FormEvent<HTMLInputElement>) => {
    const raw = e.currentTarget.value;
    // Keep only Unicode letters and spaces
    const cleaned = raw.replace(/[^\p{L}\s]/gu, '');
    if (cleaned !== raw) {
      e.currentTarget.value = cleaned;
      // Notify react-hook-form of the change
      setValue('fullName', cleaned, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/register', {
        fullName: data.fullName,
        email: data.email,
        accountType: data.accountType,
        username: data.username,
        password: data.password,
        lawyerIdNumber: data.lawyerIdNumber,
      });

      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`, {
        state: { message: t('verifyEmailMessage') },
      });
    } catch (err: unknown) {
      const axiosError = err as import('axios').AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || t('registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--app-bg)] px-4 py-10">
      <div className="absolute -right-28 top-0 h-[32rem] w-[32rem] rounded-full bg-[var(--app-accent)] opacity-[0.06] blur-[120px]" />
      <div className="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-[var(--app-accent-soft)] opacity-[0.2] blur-[120px]" />

      <div className="absolute right-6 top-6 z-20">
        <button
          type="button"
          onClick={toggleLanguage}
          className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-panel-soft)] px-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--app-muted)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--app-accent-soft)] hover:text-[var(--app-accent)]"
        >
          {language === 'en' ? 'አማርኛ' : 'English'}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[560px] animate-fade-in">
        <div className="app-auth-shell relative">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link
              to="/"
              className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-[28px] bg-[var(--app-accent)] text-white shadow-xl transition hover:-translate-y-0.5 hover:scale-[1.03]"
            >
              <ScaleIcon className="h-10 w-10" />
            </Link>
            <h1 className="app-heading text-3xl font-black leading-tight sm:text-4xl">
              {t('createAccountTitle')}
            </h1>
            <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-[var(--app-muted)] sm:text-base">
              {t('createAccountSubtitle')}
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

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Full Name - allows Amharic letters, spaces, no numbers/symbols */}
            <div className="space-y-2 md:col-span-2">
              <label className="app-label">{t('fullName')}</label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--app-muted)] transition-colors group-focus-within:text-[var(--app-accent)]">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder={t('fullName')}
                  {...register('fullName')}
                  onInput={handleNameInput}
                  className="app-input pl-10"
                  autoComplete="name"
                />
              </div>
              {errors.fullName && <p className="app-error">{errors.fullName.message}</p>}
            </div>

            {/* Rest of form fields (unchanged) */}
            <div className="space-y-2">
              <label className="app-label">{t('email')}</label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--app-muted)] transition-colors group-focus-within:text-[var(--app-accent)]">
                  <EnvelopeIcon className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder={t('enterEmail')}
                  {...register('email')}
                  className="app-input pl-10"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="app-error">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="app-label">{t('accountType')}</label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--app-muted)] transition-colors group-focus-within:text-[var(--app-accent)]">
                  <IdentificationIcon className="h-4 w-4" />
                </div>
                <select {...register('accountType')} className="app-input appearance-none pl-10">
                  <option value="">{t('selectRole')}</option>
                  <option value="User">{t('publicUser')}</option>
                  <option value="Lawyer">{t('lawyer')}</option>
                </select>
              </div>
              {errors.accountType && <p className="app-error">{errors.accountType.message}</p>}
            </div>

            {selectedAccountType === 'Lawyer' && (
              <div className="space-y-2 md:col-span-2 animate-fade-in">
                <label className="app-label">{t('lawyerIdNumber')}</label>
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--app-muted)] transition-colors group-focus-within:text-[var(--app-accent)]">
                    <IdentificationIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder={t('enterLawyerId')}
                    {...register('lawyerIdNumber')}
                    className="app-input pl-10"
                    autoComplete="off"
                  />
                </div>
                {errors.lawyerIdNumber && <p className="app-error">{errors.lawyerIdNumber.message}</p>}
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <label className="app-label">{t('username')}</label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--app-muted)] transition-colors group-focus-within:text-[var(--app-accent)]">
                  <IdentificationIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder={t('username')}
                  {...register('username')}
                  className="app-input pl-10"
                  autoComplete="username"
                />
              </div>
              {errors.username && <p className="app-error">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="app-label">{t('password')}</label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--app-muted)] transition-colors group-focus-within:text-[var(--app-accent)]">
                  <KeyIcon className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  {...register('password')}
                  className="app-input pl-10"
                  autoComplete="new-password"
                />
              </div>
              <PasswordStrengthIndicator password={watch('password')} />
              {errors.password && <p className="app-error">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="app-label">{t('confirmPassword')}</label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--app-muted)] transition-colors group-focus-within:text-[var(--app-accent)]">
                  <KeyIcon className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  placeholder={t('confirmNewPassword')}
                  {...register('confirmPassword')}
                  className="app-input pl-10"
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && <p className="app-error">{errors.confirmPassword.message}</p>}
            </div>

            <div className="md:col-span-2 pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="app-btn-primary flex w-full items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  t('register')
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-[var(--app-border)] pt-6 text-center">
            <p className="text-sm font-medium text-[var(--app-muted)]">
              {t('alreadyHaveAccount')}{' '}
              <Link to="/login" className="app-link ml-1 hover:underline">
                {t('loginHere')}
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
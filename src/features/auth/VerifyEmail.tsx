import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { EnvelopeIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../i18n';
import { authService } from './authService';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError(t('invalidCode'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.verifyEmail(email as string, code);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { message: t('emailVerifiedSuccess') } });
      }, 2500);
    } catch (err: unknown) {
      const axErr = err as import('axios').AxiosError<{ message?: string }>;
      setError(axErr.response?.data?.message || t('verificationFailed'));
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

      <div className="relative z-10 w-full max-w-[480px] animate-fade-in">
        <div className="app-auth-shell relative text-center">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-6 rounded-3xl bg-[var(--app-accent)] p-5 shadow-xl">
              <EnvelopeIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="app-heading mb-2 text-3xl font-black leading-tight tracking-tight">
              {t('verifyEmailTitle')}
            </h1>
            <p className="app-muted text-sm font-medium">
              {t('verifyEmailSubtitle')}
              <br />
              <strong className="text-[var(--app-text)]">{email}</strong>
            </p>
          </div>

          {error && <div className="app-alert-error mb-6 text-center animate-shake">{error}</div>}

          {success && (
            <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm font-semibold text-green-700">
              {t('emailVerifiedSuccess')}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="app-input h-16 text-center font-mono text-3xl tracking-[1em]"
                    style={{ paddingLeft: 'calc(1rem + 0.5em)' }}
                    autoFocus
                    inputMode="numeric"
                    aria-label={t('verifyCode')}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="app-btn-primary flex h-12 w-full items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)] active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:shadow-none"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  t('verifyCode')
                )}
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-[var(--app-border)] pt-6 text-center">
            <p className="text-sm font-medium text-[var(--app-muted)]">
              {t('didNotReceiveCode')}{' '}
              <Link to="/register" className="app-link hover:underline">
                {t('registerAgain')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// src/components/PasswordStrengthIndicator.tsx
import { useLanguage } from '../i18n';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const { t } = useLanguage();

  return (
    <div className="mt-2 space-y-1 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-[var(--app-muted)]">{t('passwordStrength')}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <span className={password.length > 7 ? 'text-green-500' : 'text-rose-500'}>
          {t('pwd8Chars')}
        </span>
        <span className={/[A-Z]/.test(password) ? 'text-green-500' : 'text-rose-500'}>
          {t('pwdUppercase')}
        </span>
        <span className={/[0-9]/.test(password) ? 'text-green-500' : 'text-rose-500'}>
          {t('pwdNumber')}
        </span>
        <span className={/[^A-Za-z0-9]/.test(password) ? 'text-green-500' : 'text-rose-500'}>
          {t('pwdSymbol')}
        </span>
      </div>
    </div>
  );
};
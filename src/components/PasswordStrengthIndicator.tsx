import { useState, useEffect } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (!password) {
      setStrength(0);
      return;
    }
    if (password.length > 7) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Add extra point for length > 12 if they have at least 3 other types
    if (password.length > 12 && score >= 3) score += 1;

    setStrength(score);
  }, [password]);

  const getStrengthData = () => {
    switch (strength) {
      case 0: return { color: 'bg-[var(--app-border)]', text: 'Weak', width: '0%' };
      case 1: return { color: 'bg-red-500', text: 'Weak', width: '25%' };
      case 2: return { color: 'bg-orange-500', text: 'Fair', width: '50%' };
      case 3: return { color: 'bg-yellow-500', text: 'Good', width: '75%' };
      case 4: 
      case 5: return { color: 'bg-green-500', text: 'Strong', width: '100%' };
      default: return { color: 'bg-[var(--app-border)]', text: '', width: '0%' };
    }
  };

  const { color, text, width } = getStrengthData();

  if (!password) {
    return (
      <div className="mt-2 text-xs text-[var(--app-muted)]">
        Use 8+ characters with a mix of letters, numbers & symbols.
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1 animate-fade-in">
      <div className="flex justify-between items-center text-xs font-medium">
        <span className="text-[var(--app-muted)]">{t("passwordStrength")}</span>
        <span className={strength <= 2 ? 'text-orange-500' : 'text-green-500'}>
          {text}
        </span>
      </div>
      <div className="h-1.5 w-full bg-[var(--app-bg)] rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300 ease-out`} 
          style={{ width }}
        />
      </div>
      <div className="text-[10px] text-[var(--app-muted)] pt-1 flex flex-wrap gap-x-2 gap-y-1">
        <span className={password.length > 7 ? 'text-green-500' : ''}>{t("pwd8Chars")}</span>
        <span className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>{t("pwdUppercase")}</span>
        <span className={/[0-9]/.test(password) ? 'text-green-500' : ''}>{t("pwdNumber")}</span>
        <span className={/[^A-Za-z0-9]/.test(password) ? 'text-green-500' : ''}>{t("pwdSymbol")}</span>
      </div>
    </div>
  );
};

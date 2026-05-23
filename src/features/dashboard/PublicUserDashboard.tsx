import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';
import { NewsWidget } from '../../components/widgets/NewsWidget';
import { NotificationsWidget } from '../../components/widgets/NotificationsWidget';
import { useLanguage } from '../../i18n';
import { QrCodeScanner } from '../../components/QrCodeScanner';

interface CaseStatus {
  case_type: string;
  case_number: string;
  status: string;
  next_hearing?: string;
}

export const PublicUserDashboard = () => {
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const [caseNumber, setCaseNumber] = useState('');
  const [caseStatus, setCaseStatus] = useState<CaseStatus | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const fetchCaseStatus = async (number: string) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get<CaseStatus>(`/cases/track/${number}`);
      setCaseStatus(data);
    } catch {
      setError(t('caseNotFound') || 'Case not found');
      setCaseStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNumber.trim()) return;
    await fetchCaseStatus(caseNumber.trim());
  };

  const handleScanSuccess = async (decodedText: string) => {
    let scannedNumber = decodedText.trim();
    if (scannedNumber.includes('/cases/')) {
      const parts = scannedNumber.split('/cases/');
      scannedNumber = parts[parts.length - 1];
    }
    setCaseNumber(scannedNumber);
    await fetchCaseStatus(scannedNumber);
  };

  const translateStatus = (status: string): string => {
    const key = `status_${status.toLowerCase()}`;
    return t(key) || status;
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-6 sm:pb-10">
      {/* Premium Welcome Hero – fully responsive */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[40px] bg-[image:var(--app-sidebar-bg)] p-5 sm:p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-4 sm:mb-6">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-white/80">
                {t('systemOnline') || 'SYSTEM ONLINE'}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-2 sm:mb-4 leading-tight">
              {t('appName') || 'eCourt'} <br className="sm:hidden" />
              <span className="text-[var(--app-accent)]">{t('courtPortal') || 'Court Portal'}</span>
            </h1>
            <p className="text-white/50 text-sm sm:text-base md:text-lg lg:text-xl font-medium max-w-xl leading-relaxed">
              {t('welcomeBack') || 'Welcome back'},{' '}
              <span className="text-white">{user?.full_name || user?.username}</span>.{' '}
              {t('publicDashboardSub') || 'Track your cases and stay informed.'}
            </p>
          </div>
        </div>

        {/* Abstract Background Effects – scaled down on mobile */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 sm:w-[500px] sm:h-[500px] bg-[var(--app-accent)] opacity-20 rounded-full blur-[80px] sm:blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 h-48 sm:w-[300px] sm:h-[300px] bg-[var(--app-accent)] opacity-10 rounded-full blur-[60px] sm:blur-[100px]"></div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:gap-10">
        {/* Track Case Section */}
        <div className="app-card border-2 border-[var(--app-accent-soft)] p-5 sm:p-6 md:p-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
            <div className="p-3 sm:p-4 bg-[var(--app-panel-muted)] rounded-xl sm:rounded-2xl text-[var(--app-accent)] shadow-inner">
              <MagnifyingGlassIcon className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-display tracking-tight">
                {t('Track Your Case') || 'Track Your Case'}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--app-muted)] mt-1">
                {t('trackCaseSub') || 'Enter your case number to see the latest status.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleCheckStatus} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('Enter Case Number') || 'Enter case number'}
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                className="app-input pl-4 sm:pl-6 pr-10 sm:pr-12 py-3 sm:py-4 text-base sm:text-lg w-full"
                required
              />
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-[var(--app-muted)] hover:text-[var(--app-accent)] transition-colors p-1"
                title={t('scanQrCode') || 'Scan QR Code'}
              >
                <QrCodeIcon className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="app-btn-primary py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg font-bold"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              ) : (
                t('Check') || 'Check'
              )}
            </button>
          </form>

          {error && (
            <div className="mt-5 sm:mt-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-bold animate-shake text-center">
              {error}
            </div>
          )}

          {caseStatus && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[var(--app-panel-soft)] border border-[var(--app-accent-soft)] animate-fade-in">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                <h3 className="font-bold text-base sm:text-lg">
                  {t('caseStatusFound') || 'Case Status Found'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <StatusInfo
                  label={t('caseType') || 'Case Type'}
                  value={caseStatus.case_type}
                />
                <StatusInfo
                  label={t('caseNumber') || 'Case Number'}
                  value={caseStatus.case_number}
                />
                <StatusInfo
                  label={t('status') || 'Status'}
                  value={translateStatus(caseStatus.status)}
                  highlight
                />
              </div>
              {caseStatus.next_hearing && (
                <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-[var(--app-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs sm:text-sm font-bold text-[var(--app-muted)]">
                    {t('nextHearing') || 'Next Hearing'}
                  </p>
                  <p className="text-xs sm:text-sm font-black text-[var(--app-accent)]">
                    {new Date(caseStatus.next_hearing).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* News Widget – full width */}
        <NewsWidget />

        {/* Notifications Widget – stacked below */}
        <NotificationsWidget />
      </div>

      {showScanner && (
        <QrCodeScanner onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
};

const StatusInfo = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div>
    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] mb-1">
      {label}
    </p>
    <p
      className={`text-sm sm:text-base font-bold ${
        highlight ? 'text-[var(--app-accent)]' : 'text-[var(--app-text)]'
      }`}
    >
      {value}
    </p>
  </div>
);
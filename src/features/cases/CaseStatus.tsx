import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../lib/axios';
import { MagnifyingGlassIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../i18n';
import { QrCodeScanner } from '../../components/QrCodeScanner';

interface CaseData {
  case_id: number;
  case_number: string;
  case_type: string;
  status: string;
  filing_date: string;
  next_hearing?: string;
  judge_name?: string;
}

export const CaseStatus = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [caseNumber, setCaseNumber] = useState('');
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Helper to translate status
  const translateStatus = (status: string): string => {
    const key = `status_${status.toLowerCase()}`;
    return t(key) || status;
  };

  const fetchCaseStatus = async (number: string) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get<CaseData>(`/cases/track/${number}`);
      setCaseData(data);
    } catch {
      setError(t('caseNotFound') || 'Case not found');
      setCaseData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryNumber = searchParams.get('number');
    if (queryNumber) {
      setCaseNumber(queryNumber);
      fetchCaseStatus(queryNumber);
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNumber.trim()) return;
    await fetchCaseStatus(caseNumber.trim());
  };

  const handleScanSuccess = async (decodedText: string) => {
    let scannedNumber = decodedText.trim();
    // Safely extract the case number/ID if the QR code was encoded as a direct URL
    if (scannedNumber.includes('/cases/')) {
      const parts = scannedNumber.split('/cases/');
      scannedNumber = parts[parts.length - 1];
    }

    setCaseNumber(scannedNumber);
    await fetchCaseStatus(scannedNumber);
  };

  return (
    <div className="app-form-shell max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('trackCaseStatus') || 'Track Case Status'}</h1>

      <form onSubmit={handleSearch} className="flex mb-6">
        <input
          value={caseNumber}
          onChange={(e) => setCaseNumber(e.target.value)}
          placeholder={t('enterCaseNumber') || 'Enter case number'}
          className="app-input flex-1 rounded-r-none !py-2 border-r-0"
          required
        />
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="px-4 bg-[var(--app-panel-soft)] hover:bg-[var(--app-accent-soft)] hover:text-[var(--app-accent)] border border-y-[var(--app-border)] border-x-0 transition-colors flex items-center justify-center text-[var(--app-muted)]"
          title={t('scanQrCode') || 'Scan QR Code'}
        >
          <QrCodeIcon className="h-5 w-5" />
        </button>
        <button
          type="submit"
          disabled={loading}
          className="app-btn-primary rounded-l-none flex items-center"
        >
          <MagnifyingGlassIcon className="h-5 w-5 mr-1" /> {t('track') || 'Track'}
        </button>
      </form>

      {error && <p className="app-error">{error}</p>}

      {caseData && (
        <div className="app-panel-soft">
          <h2 className="font-semibold mb-2">
            {caseData.case_type} - {caseData.case_number}
          </h2>
          <p>
            <strong>{t('status') || 'Status'}:</strong>{' '}
            <span className="capitalize">{translateStatus(caseData.status)}</span>
          </p>
          <p>
            <strong>{t('filedDate') || 'Filed Date'}:</strong>{' '}
            {new Date(caseData.filing_date).toLocaleDateString()}
          </p>
          <p>
            <strong>{t('nextHearing') || 'Next Hearing'}:</strong>{' '}
            {caseData.next_hearing
              ? new Date(caseData.next_hearing).toLocaleString()
              : t('notScheduled') || 'Not scheduled'}
          </p>
          <p>
            <strong>{t('judgeName') || 'Judge'}:</strong>{' '}
            {caseData.judge_name || t('notAssigned') || 'Not assigned'}
          </p>
        </div>
      )}

      {showScanner && (
        <QrCodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};
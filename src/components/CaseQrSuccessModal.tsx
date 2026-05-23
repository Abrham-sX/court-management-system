import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowDownTrayIcon, ClipboardDocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CaseQrSuccessModalProps {
  isOpen: boolean;
  caseNumber: string | null;
  onClose: () => void;
  onGoToCases: () => void;
}

export const CaseQrSuccessModal = ({
  isOpen,
  caseNumber,
  onClose,
  onGoToCases,
}: CaseQrSuccessModalProps) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const generateQr = async () => {
      if (!isOpen || !caseNumber) {
        setQrCodeDataUrl('');
        setError(null);
        return;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const payload = JSON.stringify({
          type: 'case-registration',
          case_number: caseNumber,
          track_path: `/cases/track/${caseNumber}`,
        });

        const dataUrl = await QRCode.toDataURL(payload, {
          width: 320,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#111111',
            light: '#ffffff',
          },
        });

        if (isMounted) {
          setQrCodeDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Failed to generate QR code', err);
        if (isMounted) {
          setError('Could not generate the case QR code.');
        }
      } finally {
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    };

    generateQr();

    return () => {
      isMounted = false;
    };
  }, [isOpen, caseNumber]);

  const handleDownload = () => {
    if (!qrCodeDataUrl || !caseNumber) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `case-${caseNumber}-qr.png`;
    link.click();
  };

  const handleCopyCaseNumber = async () => {
    if (!caseNumber) return;
    await navigator.clipboard.writeText(caseNumber);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-[28px] border border-[var(--app-border)] bg-[var(--app-panel)] p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--app-muted)]">
              Case registered successfully
            </p>
            <h2 className="mt-2 text-2xl font-black text-[var(--app-text)]">
              QR code created for {caseNumber}
            </h2>
            <p className="mt-2 text-sm text-[var(--app-muted)]">
              This QR belongs to the registered case only.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--app-border)] p-2 text-[var(--app-muted)] hover:bg-[var(--app-panel-soft)] hover:text-[var(--app-text)]"
            aria-label="Close success dialog"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-[24px] border border-[var(--app-border)] bg-white p-5 text-center">
          {isGenerating ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--app-border)] border-t-[var(--app-accent)]" />
            </div>
          ) : error ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <p className="text-sm font-semibold text-rose-500">{error}</p>
            </div>
          ) : (
            <>
              <img
                src={qrCodeDataUrl}
                alt={`QR code for case ${caseNumber}`}
                className="mx-auto h-[280px] w-[280px] rounded-2xl border border-slate-200"
              />
              <p className="mt-4 text-sm font-semibold text-slate-700">
                Scan this QR to identify only this registered case.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleCopyCaseNumber}
            disabled={!caseNumber}
            className="app-btn-secondary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            <ClipboardDocumentIcon className="h-5 w-5" />
            Copy Case #
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!qrCodeDataUrl}
            className="app-btn-secondary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Download QR
          </button>

          <button
            type="button"
            onClick={onGoToCases}
            className="app-btn-primary py-3"
          >
            View Cases
          </button>
        </div>
      </div>
    </div>
  );
};

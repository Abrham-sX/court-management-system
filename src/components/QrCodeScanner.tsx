import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CameraIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../i18n';

interface QrCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QrCodeScanner = ({ onScanSuccess, onClose }: QrCodeScannerProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const elementId = "qr-scanner-element";

  const startCamera = async (scannerInstance: Html5Qrcode) => {
    setError(null);
    try {
      await scannerInstance.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopCamera();
          onClose();
        },
        () => {} // silent frame failures
      );
    } catch (err: any) {
      console.error("Camera failed to start", err);
      setError(t('cameraPermissionDenied') || 'Camera permission denied or camera not found.');
    }
  };

  const stopCamera = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  useEffect(() => {
    const html5Qrcode = new Html5Qrcode(elementId);
    html5QrcodeRef.current = html5Qrcode;

    if (activeTab === 'camera') {
      startCamera(html5Qrcode);
    }

    return () => {
      if (html5Qrcode.isScanning) {
        html5Qrcode.stop().catch(err => console.error("Error stopping in cleanup", err));
      }
    };
  }, [activeTab, onScanSuccess]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadError(null);
    try {
      if (html5QrcodeRef.current) {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
        const decodedText = await html5QrcodeRef.current.scanFile(file, true);
        onScanSuccess(decodedText);
        onClose();
      } else {
        const html5Qrcode = new Html5Qrcode(elementId);
        const decodedText = await html5Qrcode.scanFile(file, true);
        onScanSuccess(decodedText);
        onClose();
      }
    } catch (err) {
      console.error("Failed to decode QR code from file", err);
      setUploadError(t('invalidQrImage') || 'Could not find a valid QR code in this image.');
    }
  };

  const handleClose = async () => {
    await stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-[var(--app-panel)] rounded-[32px] p-8 w-full max-w-md border border-[var(--app-border)] shadow-2xl relative flex flex-col items-center">
        
        {/* Close Button */}
        <button 
          onClick={handleClose} 
          className="absolute top-6 right-6 p-2 hover:bg-[var(--app-panel-soft)] rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          aria-label={t('close') || 'Close'}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Title */}
        <h3 className="text-xl font-black mb-6 flex items-center gap-2 self-start">
          <CameraIcon className="h-6 w-6 text-[var(--app-accent)]" /> 
          {t('scanQrCodeTitle') || 'Scan Case QR Code'}
        </h3>

        {/* Tab Controls */}
        <div className="flex w-full bg-[var(--app-panel-soft)] p-1 rounded-2xl mb-6 border border-[var(--app-border)]">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'camera' 
                ? 'bg-white dark:bg-[var(--app-panel)] text-[var(--app-accent)] shadow-sm' 
                : 'text-[var(--app-muted)] hover:opacity-80'
            }`}
          >
            {t('cameraScanner') || 'Camera Scanner'}
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'upload' 
                ? 'bg-white dark:bg-[var(--app-panel)] text-[var(--app-accent)] shadow-sm' 
                : 'text-[var(--app-muted)] hover:opacity-80'
            }`}
          >
            {t('uploadQrImage') || 'Upload QR Image'}
          </button>
        </div>

        {/* Camera Container */}
        <div className={`w-full flex flex-col items-center ${activeTab === 'camera' && !error ? '' : 'hidden'}`}>
          <div 
            id={elementId} 
            className="w-full aspect-square max-w-[280px] overflow-hidden rounded-[24px] border border-[var(--app-border)] bg-black shadow-inner"
          />
          <p className="text-xs text-[var(--app-muted)] mt-5 text-center font-medium">
            {t('cameraInstruction') || 'Point your camera at a case QR code to scan and track.'}
          </p>
        </div>

        {/* Camera Error View */}
        {activeTab === 'camera' && error && (
          <div className="text-center py-6 w-full">
            <p className="text-rose-500 font-semibold mb-6 text-sm">{error}</p>
            <button onClick={() => setActiveTab('upload')} className="app-btn-primary w-full">
              {t('tryUploadInstead') || 'Try Uploading Instead'}
            </button>
          </div>
        )}

        {/* Upload Tab View */}
        {activeTab === 'upload' && (
          <div className="w-full flex flex-col items-center">
            <label className="w-full aspect-square max-w-[280px] border-2 border-dashed border-[var(--app-border)] hover:border-[var(--app-accent)] bg-[var(--app-panel-soft)] rounded-[24px] flex flex-col items-center justify-center cursor-pointer group transition-all relative overflow-hidden">
              <div className="flex flex-col items-center text-center p-6">
                <div className="p-4 rounded-full bg-[var(--app-accent-soft)] mb-3 group-hover:scale-110 transition-transform">
                   <ArrowUpTrayIcon className="h-8 w-8 text-[var(--app-accent)]" />
                </div>
                <p className="text-sm font-bold text-[var(--app-text)]">{t('chooseQrImage') || 'Choose QR image'}</p>
                <p className="text-xs text-[var(--app-muted)] mt-1">{t('pngJpgFile') || 'PNG, JPG, or JPEG file'}</p>
              </div>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
            
            {uploadError ? (
              <p className="text-rose-500 text-xs font-bold mt-4 text-center animate-shake">
                {uploadError}
              </p>
            ) : (
              <p className="text-xs text-[var(--app-muted)] mt-5 text-center font-medium">
                {t('uploadInstruction') || 'Upload a screenshot or image of the case QR code to decode.'}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleClose}
          className="mt-8 w-full app-btn-secondary flex items-center justify-center gap-2 py-3"
        >
          {t('cancel') || 'Cancel'}
        </button>
      </div>
    </div>
  );
};
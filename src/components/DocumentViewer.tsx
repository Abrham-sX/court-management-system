import { useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../i18n';

interface DocumentViewerProps {
  documentId: number;
  fileName: string;
}

export const DocumentViewer = ({ documentId, fileName }: DocumentViewerProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/documents/${documentId}/download`;

  const isPDF = fileName.toLowerCase().endsWith('.pdf');
  const isImage = ['.jpg', '.jpeg', '.png', '.gif'].some((ext) =>
    fileName.toLowerCase().endsWith(ext)
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="app-link flex items-center space-x-2"
      >
        <DocumentTextIcon className="h-5 w-5" />
        <span>{fileName}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="app-form-shell flex h-[80vh] w-full max-w-4xl flex-col">
            <div
              className="flex items-center justify-between border-b p-4"
              style={{ borderColor: 'var(--app-border)' }}
            >
              <h3 className="font-semibold">{fileName}</h3>
              <button onClick={() => setIsOpen(false)} className="app-muted text-xl">
                x
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {isPDF ? (
                <iframe src={fileUrl} className="h-full w-full" title={fileName} />
              ) : isImage ? (
                <img src={fileUrl} alt={fileName} className="mx-auto h-auto max-w-full" />
              ) : (
                <div className="py-8 text-center">
                  <DocumentTextIcon className="app-muted mx-auto h-16 w-16" />
                  <p className="mt-4">{t('previewNotAvailable')}</p>
                  <a href={fileUrl} download className="app-link mt-2 inline-block">
                    {t('downloadFile')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

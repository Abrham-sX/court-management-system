import { useMemo, useState } from 'react';
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  PresentationChartBarIcon,
} from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';

type ReportType = {
  id: string;
  label: string;
  desc: string;
};

export const ReportsWidget = () => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState('');
  const [generating, setGenerating] = useState(false);

  const reportTypes = useMemo<ReportType[]>(
    () => [
      {
        id: 'all-cases',
        label: t('allCasesReport') || 'All Cases Report',
        desc: t('allCasesReportDesc') || 'Complete listing of all registered cases with metadata',
      },
      {
        id: 'civil',
        label: t('civilCasesSummary') || 'Civil Cases Summary',
        desc: t('civilCasesSummaryDesc') || 'Statistical overview of civil litigation matters',
      },
      {
        id: 'criminal',
        label: t('criminalCasesSummary') || 'Criminal Cases Summary',
        desc: t('criminalCasesSummaryDesc') || 'Statistical overview of criminal proceedings',
      },
    ],
    [t]
  );

  const selectedReport = reportTypes.find((report) => report.id === selected);

  const handleDownload = async () => {
    if (!selected || generating) return;

    setGenerating(true);
    try {
      const response = await apiClient.get('/reports/generate', {
        params: { type: selected },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selected}_report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert(t('failedToGenerateReport') || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  // Helper for the “ready to export” message with interpolation fallback
  const getReadyMessage = () => {
    if (!selectedReport) {
      return t('selectTemplateToBegin') || 'Select a template to begin';
    }
    const translated = t('reportReadyForGeneration', { name: selectedReport.label });
    // If the translation returned the same as the key (i.e. missing), build a fallback
    if (translated === 'reportReadyForGeneration') {
      return `Report "${selectedReport.label}" is ready for generation.`;
    }
    return translated;
  };

  return (
    <div className="app-card overflow-hidden flex flex-col min-h-[420px] transition-all">
      <div className="flex flex-col gap-4 flex-shrink-0 mb-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="app-heading text-lg font-black flex items-center min-w-0">
            <div className="p-2 bg-[var(--app-accent-soft)] rounded-xl mr-3 shrink-0">
              <DocumentChartBarIcon className="h-4 w-4 text-[var(--app-accent)]" />
            </div>
            <span className="truncate">{t('quickReports') || 'Quick Reports'}</span>
          </h2>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--app-panel-soft)] border border-[var(--app-border)] shrink-0">
            <ShieldCheckIcon className="h-4 w-4 text-[var(--app-accent)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
              {t('officialCertification') || 'OFFICIAL CERTIFICATION'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--app-muted)]">
          <div className="h-2 w-2 rounded-full bg-[var(--app-accent)]"></div>
          <span>{t('judicialDocumentCenter') || 'Judicial Document Center'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-1 space-y-5">
        <div className="app-card bg-[var(--app-panel-soft)] border border-[var(--app-border)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-base flex items-center gap-2">
              <PresentationChartBarIcon className="h-5 w-5 text-[var(--app-accent)]" />
              {t('availableReportTemplates') || 'Available Report Templates'}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelected(report.id)}
                className={`text-left p-4 rounded-3xl border-2 transition-all duration-300 group ${
                  selected === report.id
                    ? 'border-[var(--app-accent)] bg-[var(--app-accent-soft)]'
                    : 'border-[var(--app-border)] hover:border-[var(--app-accent-soft)] hover:bg-[var(--app-panel-muted)]'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl mb-3 w-fit transition-colors ${
                    selected === report.id
                      ? 'bg-[var(--app-accent)] text-white'
                      : 'bg-[var(--app-panel-soft)] text-[var(--app-accent)]'
                  }`}
                >
                  <DocumentChartBarIcon className="h-5 w-5" />
                </div>
                <h4
                  className={`font-black text-sm ${
                    selected === report.id
                      ? 'text-[var(--app-accent)]'
                      : 'text-[var(--app-text)]'
                  }`}
                >
                  {report.label}
                </h4>
                <p className="text-[11px] text-[var(--app-muted)] mt-2 leading-relaxed">
                  {report.desc || t('comprehensiveDataSnapshot') || 'Comprehensive data snapshot'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="app-card bg-[var(--app-panel-soft)] border-dashed border-2">
          <h3 className="font-bold mb-3">{t('readyToExport') || 'Ready to export'}</h3>
          <p className="text-xs text-[var(--app-muted)] leading-relaxed mb-5">
            {getReadyMessage()}
          </p>

          <button
            onClick={handleDownload}
            disabled={!selected || generating}
            className={`w-full py-3.5 rounded-2xl flex items-center justify-center space-x-3 shadow-xl transition-all active:scale-95 ${
              selected
                ? 'bg-[var(--app-accent)] text-white shadow-[var(--app-accent-soft)]'
                : 'bg-[var(--app-panel-muted)] text-[var(--app-muted)] cursor-not-allowed shadow-none'
            }`}
          >
            {generating ? (
              <>
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="font-bold text-sm">{t('generating') || 'Generating'}...</span>
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span className="font-bold text-sm">{t('downloadPdfReport') || 'Download PDF Report'}</span>
              </>
            )}
          </button>

          <div className="mt-6 pt-5 border-t border-[var(--app-border)] flex items-center gap-2 text-[var(--app-muted)]">
            <ShieldCheckIcon className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {t('certifiedDataSafe') || 'CERTIFIED DATA – COURT SEAL VERIFIED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
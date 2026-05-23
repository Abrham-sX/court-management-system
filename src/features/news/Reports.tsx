import { useState } from 'react';
import apiClient from '../../lib/axios';
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  PresentationChartBarIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../i18n';

export const Reports = () => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState('');
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
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
  ];

  const handleDownload = async () => {
    if (!selected) return;
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
      alert(t('downloadFailed') || 'Failed to download report');
    } finally {
      setGenerating(false);
    }
  };

  const selectedLabel = reportTypes.find((r) => r.id === selected)?.label || '';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="app-card overflow-hidden bg-gradient-to-br from-[var(--app-panel)] to-[var(--app-panel-soft)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--app-accent-soft)] text-[var(--app-accent)] text-[10px] font-black uppercase tracking-widest">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              <span>{t('officialCertification') || 'OFFICIAL CERTIFICATION'}</span>
            </div>
            <h1 className="text-3xl font-black text-[var(--app-text)] tracking-tight">
              {t('judicialDocumentCenter') || 'Judicial Document Center'}
            </h1>
            <p className="app-muted text-lg max-w-lg">
              {t('generateCertifiedJudicialReports') || 'Generate certified judicial reports and summaries'}
            </p>
          </div>
          <div className="p-4 rounded-3xl bg-white shadow-xl dark:bg-black/20">
            <PresentationChartBarIcon className="h-16 w-16 text-[var(--app-accent)] opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selector Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="app-card h-full">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <DocumentDuplicateIcon className="h-5 w-5 mr-2 text-[var(--app-accent)]" />
              {t('availableReportTemplates') || 'Available Report Templates'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelected(report.id)}
                  className={`text-left p-6 rounded-3xl border-2 transition-all duration-300 group ${
                    selected === report.id
                      ? 'border-[var(--app-accent)] bg-[var(--app-accent-soft)]'
                      : 'border-[var(--app-border)] hover:border-[var(--app-accent-soft)] hover:bg-[var(--app-panel-soft)]'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl mb-4 w-fit transition-colors ${
                      selected === report.id
                        ? 'bg-[var(--app-accent)] text-white'
                        : 'bg-[var(--app-panel-soft)] text-[var(--app-accent)]'
                    }`}
                  >
                    <DocumentChartBarIcon className="h-6 w-6" />
                  </div>
                  <h3
                    className={`font-black text-lg ${
                      selected === report.id
                        ? 'text-[var(--app-accent)]'
                        : 'text-[var(--app-text)]'
                    }`}
                  >
                    {report.label}
                  </h3>
                  <p className="text-xs text-[var(--app-muted)] mt-2 group-hover:text-[var(--app-text)] transition-colors">
                    {report.desc || t('comprehensiveDataSnapshot') || 'Comprehensive data snapshot'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="space-y-6">
          <div className="app-card bg-[var(--app-panel-soft)] border-dashed border-2">
            <h3 className="font-bold mb-4">{t('readyToExport') || 'Ready to export'}</h3>
            <p className="text-sm text-[var(--app-muted)] mb-6">
              {selected
                ? (t('reportReadyForGeneration') || 'Report "{name}" is ready for generation.').replace(
                    '{name}',
                    selectedLabel
                  )
                : t('selectTemplateToBegin') || 'Select a template to begin'}
            </p>

            <button
              onClick={handleDownload}
              disabled={!selected || generating}
              className={`w-full py-4 rounded-2xl flex items-center justify-center space-x-3 shadow-xl transition-all active:scale-95 ${
                selected
                  ? 'bg-[var(--app-accent)] text-white shadow-[var(--app-accent-soft)]'
                  : 'bg-[var(--app-panel-muted)] text-[var(--app-muted)] cursor-not-allowed shadow-none'
              }`}
            >
              {generating ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="font-bold">{t('generating') || 'Generating'}...</span>
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span className="font-bold">{t('downloadPdfReport') || 'Download PDF Report'}</span>
                </>
              )}
            </button>

            <div className="mt-8 pt-8 border-t border-[var(--app-border)]">
              <div className="flex items-center space-x-3 text-[var(--app-muted)]">
                <ShieldCheckIcon className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {t('certifiedDataSafe') || 'CERTIFIED DATA – COURT SEAL VERIFIED'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
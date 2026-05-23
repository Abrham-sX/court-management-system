import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import { ScaleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CaseStatusPieChart } from '../../components/charts/CaseStatusPieChart';
import { demoStatusData } from '../../components/charts/chartTheme';
import { useLanguage } from '../../i18n';

const fetchLawyerStats = async () => {
  const { data } = await apiClient.get('/lawyer/stats');
  return data;
};

export const LawyerReports = () => {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['lawyerStats'],
    queryFn: fetchLawyerStats,
  });

  const stats = data || {
    totalCases: 0,
    activeCases: 0,
    closedCases: 0,
    casesByStatus: [],
  };
  const statusData = stats.casesByStatus?.length ? stats.casesByStatus : demoStatusData;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="app-heading text-2xl font-bold">
        {t('myReports') || 'My Reports'}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="app-card-soft p-4 flex items-center space-x-3">
          <ScaleIcon className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
          <div>
            <p className="app-muted text-sm">
              {t('totalCases') || 'Total Cases'}
            </p>
            <p className="app-heading text-2xl font-bold">
              {isLoading ? '…' : stats.totalCases}
            </p>
          </div>
        </div>
        <div className="app-card-soft p-4 flex items-center space-x-3">
          <ClockIcon className="h-8 w-8" style={{ color: 'var(--color-warning, #b45309)' }} />
          <div>
            <p className="app-muted text-sm">
              {t('activeCases') || 'Active Cases'}
            </p>
            <p className="app-heading text-2xl font-bold">
              {isLoading ? '…' : stats.activeCases}
            </p>
          </div>
        </div>
        <div className="app-card-soft p-4 flex items-center space-x-3">
          <CheckCircleIcon className="h-8 w-8" style={{ color: 'var(--color-success, #047857)' }} />
          <div>
            <p className="app-muted text-sm">
              {t('closedCases') || 'Closed Cases'}
            </p>
            <p className="app-heading text-2xl font-bold">
              {isLoading ? '…' : stats.closedCases}
            </p>
          </div>
        </div>
      </div>

      <div className="app-card">
        <h2 className="app-heading text-lg font-semibold mb-4">
          {t('caseStatusBreakdown') || 'Case Status Breakdown'}
        </h2>
        {isLoading ? (
          <p className="app-muted">{t('loadingChart') || 'Loading chart...'}</p>
        ) : (
          <CaseStatusPieChart data={statusData} />
        )}
      </div>
    </div>
  );
};
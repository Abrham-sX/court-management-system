import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import { ScaleIcon, PencilIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { CaseStatusPieChart } from '../../components/charts/CaseStatusPieChart';
import { demoStatusData } from '../../components/charts/chartTheme';
import { useLanguage } from '../../i18n';

const fetchJudgeStats = async () => {
  const { data } = await apiClient.get('/judge/stats');
  return data;
};

export const JudgeReports = () => {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['judgeStats'],
    queryFn: fetchJudgeStats,
  });

  const stats = data || {
    totalCases: 0,
    pendingJudgments: 0,
    hearingsToday: 0,
    casesByStatus: [],
  };
  const statusData = stats.casesByStatus?.length ? stats.casesByStatus : demoStatusData;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="app-heading text-2xl font-bold">
        {t('myReports') || 'My Reports'}
      </h1>

      {/* Summary cards */}
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
          <PencilIcon className="h-8 w-8" style={{ color: 'var(--color-warning, #b45309)' }} />
          <div>
            <p className="app-muted text-sm">
              {t('pendingJudgments') || 'Pending Judgments'}
            </p>
            <p className="app-heading text-2xl font-bold">
              {isLoading ? '…' : stats.pendingJudgments}
            </p>
          </div>
        </div>
        <div className="app-card-soft p-4 flex items-center space-x-3">
          <CalendarIcon className="h-8 w-8" style={{ color: 'var(--color-info, #1d4ed8)' }} />
          <div>
            <p className="app-muted text-sm">
              {t('hearingsToday') || 'Hearings Today'}
            </p>
            <p className="app-heading text-2xl font-bold">
              {isLoading ? '…' : stats.hearingsToday}
            </p>
          </div>
        </div>
      </div>

      {/* Pie chart */}
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
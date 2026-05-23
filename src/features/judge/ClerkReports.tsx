import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import { DocumentTextIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { CaseStatusPieChart } from '../../components/charts/CaseStatusPieChart';
import { MonthlyCasesBarChart } from '../../components/charts/MonthlyCasesBarChart';
import { demoMonthlyData, demoStatusData } from '../../components/charts/chartTheme';
import { useLanguage } from '../../i18n';

const fetchClerkStats = async () => {
  const { data } = await apiClient.get('/clerk/stats');
  return data;
};

export const ClerkReports = () => {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['clerkStats'],
    queryFn: fetchClerkStats,
  });

  const stats = data || {
    pendingRegistrations: 0,
    upcomingHearings: 0,
    monthlyCases: 0,
    casesByStatus: [],
    monthlyFilings: [],
  };
  const statusData = stats.casesByStatus?.length ? stats.casesByStatus : demoStatusData;
  const monthlyData = stats.monthlyFilings?.length ? stats.monthlyFilings : demoMonthlyData;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="app-heading text-2xl font-bold">
        {t('clerkReports') || 'Clerk Reports'}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="app-card-soft p-4 flex items-center space-x-3">
          <DocumentTextIcon className="h-8 w-8" style={{ color: 'var(--color-warning, #b45309)' }} />
          <div>
            <p className="app-muted text-sm">
              {t('pendingRegistrations') || 'Pending Registrations'}
            </p>
            <p className="app-heading text-2xl font-bold">
              {isLoading ? '…' : stats.pendingRegistrations}
            </p>
          </div>
        </div>
        <div className="app-card-soft p-4 flex items-center space-x-3">
          <CalendarIcon className="h-8 w-8" style={{ color: 'var(--color-info, #1d4ed8)' }} />
          <div>
            <p className="app-muted text-sm">
              {t('upcomingHearings') || 'Upcoming Hearings'}
            </p>
            <p className="app-heading text-2xl font-bold">
              {isLoading ? '…' : stats.upcomingHearings}
            </p>
          </div>
        </div>
        <div className="app-card-soft p-4 flex items-center space-x-3">
          <CheckCircleIcon className="h-8 w-8" style={{ color: 'var(--color-success, #047857)' }} />
          <div>
            <p className="app-muted text-sm">
              {t('casesThisMonth') || 'Cases This Month'}
            </p>
            <p className="app-heading text-2xl font-bold">
              {isLoading ? '…' : stats.monthlyCases}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="app-card">
          <h2 className="app-heading text-lg font-semibold mb-4">
            {t('casesByStatus') || 'Cases by Status'}
          </h2>
          {isLoading ? (
            <p className="app-muted">{t('loadingChart') || 'Loading chart...'}</p>
          ) : (
            <CaseStatusPieChart data={statusData} />
          )}
        </div>
        <div className="app-card">
          <h2 className="app-heading text-lg font-semibold mb-4">
            {t('monthlyFilings') || 'Monthly Filings'}
          </h2>
          {isLoading ? (
            <p className="app-muted">{t('loadingChart') || 'Loading chart...'}</p>
          ) : (
            <MonthlyCasesBarChart data={monthlyData} />
          )}
        </div>
      </div>
    </div>
  );
};
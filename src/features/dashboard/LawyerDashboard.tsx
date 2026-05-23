import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ScaleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';
import { CaseStatusPieChart } from '../../components/charts/CaseStatusPieChart';
import { demoStatusData } from '../../components/charts/chartTheme';
import { NewsWidget } from '../../components/widgets/NewsWidget';
import { NotificationsWidget } from '../../components/widgets/NotificationsWidget';
import { UpcomingHearingsWidget } from '../../components/widgets/UpcomingHearingsWidget';
import { useLanguage } from '../../i18n';

interface Case {
  case_id: number;
  case_number: string;
  case_type: string;
  status: string;
  client_name?: string;
  plaintiff_name: string;
  next_hearing?: string;
}

interface LawyerStats {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  casesByStatus: { name: string; value: number }[];
}

const fetchLawyerStats = async (): Promise<LawyerStats> => {
  const { data } = await apiClient.get('/lawyer/stats');
  return data;
};

const fetchLawyerCases = async (): Promise<Case[]> => {
  const { data } = await apiClient.get('/lawyer/cases');
  return data;
};

// StatCard component defined before use
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
  liveLabel: string;
}

const StatCard = ({ title, value, icon: Icon, loading, liveLabel }: StatCardProps) => (
  <div className="app-card group">
    <div className="flex items-center justify-between mb-4">
      <div className="app-stat-icon bg-[var(--app-accent-soft)] text-[var(--app-accent)] shadow-sm group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-[10px] font-bold text-[var(--app-accent)] bg-[var(--app-accent-soft)] px-2 py-1 rounded-lg">
        {liveLabel}
      </div>
    </div>
    <div>
      <p className="text-[var(--app-muted)] text-xs font-bold uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className="app-heading text-3xl font-black">
        {loading ? (
          <span className="inline-block w-12 h-8 bg-[var(--app-panel-muted)] animate-pulse rounded-lg"></span>
        ) : (
          value
        )}
      </p>
    </div>
  </div>
);

export const LawyerDashboard = () => {
  const { user } = useAuthStore();
  const { t } = useLanguage();

  const { data: stats } = useQuery({
    queryKey: ['lawyerStats'],
    queryFn: fetchLawyerStats,
  });

  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ['lawyerCases'],
    queryFn: fetchLawyerCases,
  });

  const displayStats: LawyerStats = stats || {
    totalCases: 0,
    activeCases: 0,
    closedCases: 0,
    casesByStatus: [],
  };

  const activeCasesList = cases?.filter((c) => c.status !== 'Closed') || [];
  const closedCasesList = cases?.filter((c) => c.status === 'Closed') || [];

  const statusData = displayStats.casesByStatus?.length
    ? displayStats.casesByStatus
    : activeCasesList.length || closedCasesList.length
      ? [
          { name: t('activeCases') || 'Active', value: activeCasesList.length },
          { name: t('closedCases') || 'Closed', value: closedCasesList.length },
        ]
      : demoStatusData;

  const liveLabel = t('active') || 'ACTIVE';
  const welcomeSub =
    t('Lawyer Dashboard Welcome Sub', { count: activeCasesList.length }) ||
    `You are managing ${activeCasesList.length} active case(s).`;

  const translateStatus = (status: string): string => {
    const key = `status_${status.toLowerCase()}`;
    return t(key) || status;
  };

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[var(--app-accent)] to-[var(--app-accent-hover)] p-10 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">
            {t('Welcome Back') || 'Welcome back'}, {user?.full_name || user?.username}
          </h1>
          <p className="text-white/70 text-lg max-w-xl leading-relaxed">{welcomeSub}</p>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('totalCases') || 'Total Cases'}
          value={displayStats.totalCases || cases?.length || 0}
          icon={ScaleIcon}
          loading={casesLoading}
          liveLabel={liveLabel}
        />
        <StatCard
          title={t('activeCases') || 'Active Cases'}
          value={displayStats.activeCases || activeCasesList.length}
          icon={ClockIcon}
          loading={casesLoading}
          liveLabel={liveLabel}
        />
        <StatCard
          title={t('closedCases') || 'Closed Cases'}
          value={displayStats.closedCases || closedCasesList.length}
          icon={CheckCircleIcon}
          loading={casesLoading}
          liveLabel={liveLabel}
        />
      </div>

      {/* Main Content: Charts | Notifications */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1.05fr)] gap-6 xl:gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Case Status Pie Chart */}
            <div className="app-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-display">
                  {t('Case Status Breakdown') || 'Case Status Breakdown'}
                </h2>
                <div className="p-2 bg-[var(--app-accent-soft)] rounded-xl">
                  <ChartBarIcon className="h-5 w-5 text-[var(--app-accent)]" />
                </div>
              </div>
              <div className="h-80 flex items-center justify-center">
                <CaseStatusPieChart data={statusData} />
              </div>
            </div>

            <UpcomingHearingsWidget />
          </div>
        </div>

        {/* Notifications Column */}
        <div className="w-full min-w-0">
          <NotificationsWidget />
        </div>
      </div>

      {/* Active Cases Table */}
      <div className="app-card overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold font-display">
            {t('Your Active Cases') || 'Your Active Cases'}
          </h2>
          <Link
            to="/lawyer/cases"
            className="text-xs font-black uppercase tracking-widest text-[var(--app-accent)] hover:underline"
          >
            {t('fullLitigationList') || 'VIEW ALL'}
          </Link>
        </div>

        {casesLoading ? (
          <div className="space-y-4">
            <div className="h-10 w-full bg-[var(--app-panel-muted)] animate-pulse rounded-lg"></div>
            <div className="h-20 w-full bg-[var(--app-panel-muted)] animate-pulse rounded-lg"></div>
          </div>
        ) : activeCasesList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--app-border)]">
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                    {t('caseNumber') || 'Case Number'}
                  </th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                    {t('caseType') || 'Case Type'}
                  </th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                    {t('client') || 'Client'}
                  </th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                    {t('status') || 'Status'}
                  </th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] text-right">
                    {t('nextHearing') || 'Next Hearing'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {activeCasesList.map((c) => {
                  const statusDisplay = translateStatus(c.status);
                  return (
                    <tr key={c.case_id} className="group hover:bg-[var(--app-panel-muted)] transition-colors">
                      <td className="py-5 font-bold text-sm">{c.case_number}</td>
                      <td className="py-5 text-sm text-[var(--app-muted)]">{c.case_type}</td>
                      <td className="py-5 text-sm font-medium">{c.client_name || c.plaintiff_name}</td>
                      <td className="py-5">
                        <span className="app-badge app-badge-warning">{statusDisplay}</span>
                      </td>
                      <td className="py-5 text-sm text-right font-black opacity-40 group-hover:opacity-100 transition-opacity">
                        {c.next_hearing
                          ? new Date(c.next_hearing).toLocaleDateString()
                          : t('notScheduled') || 'Not scheduled'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="app-muted">{t('noData') || 'No active cases found.'}</p>
          </div>
        )}
      </div>

      {/* News Widget */}
      <NewsWidget />
    </div>
  );
};
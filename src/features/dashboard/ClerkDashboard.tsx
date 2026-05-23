import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ScaleIcon,
  CalendarIcon,
  PlusCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';
import { CaseStatusPieChart } from '../../components/charts/CaseStatusPieChart';
import { MonthlyCasesBarChart } from '../../components/charts/MonthlyCasesBarChart';
import { demoMonthlyData, demoStatusData } from '../../components/charts/chartTheme';
import { NewsWidget } from '../../components/widgets/NewsWidget';
import { NotificationsWidget } from '../../components/widgets/NotificationsWidget';
import { useLanguage } from '../../i18n';
import { Table } from '../../components/Table';

interface RecentCase {
  case_id: number;
  case_number: string;
  case_type: string;
  plaintiff_name: string;
  status: string;
  filing_date: string;
}

interface ClerkStats {
  pendingRegistrations: number;
  upcomingHearings: number;
  monthlyCases: number;
  casesByStatus: { name: string; value: number }[];
  monthlyFilings: { month: string; cases: number }[];
}

const fetchClerkStats = async (): Promise<ClerkStats> => {
  const { data } = await apiClient.get('/clerk/stats');
  return data;
};

const fetchRecentCases = async (): Promise<RecentCase[]> => {
  const { data } = await apiClient.get('/cases/recent');
  return data;
};

export const ClerkDashboard = () => {
  const { user } = useAuthStore();
  const { t } = useLanguage();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['clerkStats'],
    queryFn: fetchClerkStats,
  });

  const { data: recentCases, isLoading: casesLoading } = useQuery({
    queryKey: ['recentCases'],
    queryFn: fetchRecentCases,
  });

  const displayStats = stats || {
    pendingRegistrations: 0,
    upcomingHearings: 0,
    monthlyCases: 0,
    casesByStatus: [],
    monthlyFilings: [],
  };

  const statusData = displayStats.casesByStatus?.length
    ? displayStats.casesByStatus
    : demoStatusData;

  const monthlyData = displayStats.monthlyFilings?.length
    ? displayStats.monthlyFilings
    : demoMonthlyData;

  // Pre‑translate static labels
  const liveLabel = t('live') || 'LIVE';
  const welcomeSub = t('clerkDashboardWelcomeSub', { count: displayStats.pendingRegistrations }) ||
    `You have ${displayStats.pendingRegistrations} pending registrations.`;

  // Helper to translate status
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
            {t('welcomeBack') || 'Welcome back'}, {user?.full_name || user?.username}
          </h1>
          <p className="text-white/70 text-lg max-w-xl leading-relaxed">
            {welcomeSub}
          </p>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-black/10 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title={t('pendingRegistrations') || 'Pending Registrations'}
          value={displayStats.pendingRegistrations}
          icon={ClockIcon}
          loading={statsLoading}
          liveLabel={liveLabel}
        />
        <StatCard
          title={t('upcomingHearings') || 'Upcoming Hearings'}
          value={displayStats.upcomingHearings}
          icon={CalendarIcon}
          loading={statsLoading}
          liveLabel={liveLabel}
        />
        <StatCard
          title={t('casesThisMonth') || 'Cases This Month'}
          value={displayStats.monthlyCases}
          icon={CheckCircleIcon}
          loading={statsLoading}
          liveLabel={liveLabel}
        />
      </div>

      {/* Main Content: Quick Actions + Charts | Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Actions Panel */}
          <div className="app-card">
            <div className="flex items-center justify-between mb-8">
              <h2 className="app-heading text-xl font-bold">
                {t('quickActions') || 'Quick Actions'}
              </h2>
              <span className="text-xs uppercase tracking-widest text-[var(--app-muted)]">
                {t('Operations') || 'Operations'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/hearings/schedule"
                className="group flex items-center p-4 rounded-2xl bg-[var(--app-panel-soft)] border border-[var(--app-border)] hover:bg-[var(--app-accent)] transition-all"
              >
                <div className="p-3 rounded-xl bg-white/50 group-hover:bg-white/20 mr-4">
                  <CalendarIcon className="h-6 w-6 text-[var(--app-accent)] group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-[var(--app-muted)] group-hover:text-white/60 mb-0.5">
                    {t('scheduler') || 'SCHEDULER'}
                  </p>
                  <p className="text-sm font-bold group-hover:text-white">
                    {t('Schedule Hearing') || 'Schedule Hearing'}
                  </p>
                </div>
              </Link>
              <Link
                to="/cases/all"
                className="group flex items-center p-4 rounded-2xl bg-[var(--app-panel-soft)] border border-[var(--app-border)] hover:bg-[var(--app-accent)] transition-all"
              >
                <div className="p-3 rounded-xl bg-white/50 group-hover:bg-white/20 mr-4">
                  <ScaleIcon className="h-6 w-6 text-[var(--app-accent)] group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-[var(--app-muted)] group-hover:text-white/60 mb-0.5">
                    {t('archives') || 'ARCHIVES'}
                  </p>
                  <p className="text-sm font-bold group-hover:text-white">
                    {t('viewAllCases') || 'View All Cases'}
                  </p>
                </div>
              </Link>
              <Link
                to="/clerk/reports"
                className="group flex items-center p-4 rounded-2xl bg-[var(--app-panel-soft)] border border-[var(--app-border)] hover:bg-[var(--app-accent)] transition-all"
              >
                <div className="p-3 rounded-xl bg-white/50 group-hover:bg-white/20 mr-4">
                  <PlusCircleIcon className="h-6 w-6 text-[var(--app-accent)] group-hover:text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-[var(--app-muted)] group-hover:text-white/60 mb-0.5">
                    {t('statistics') || 'STATISTICS'}
                  </p>
                  <p className="text-sm font-bold group-hover:text-white">
                    {t('reports') || 'Reports'}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
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
            <div className="app-card">
              <h2 className="text-xl font-bold font-display mb-6">
                {t('Monthly Case Filings') || 'Monthly Case Filings'}
              </h2>
              <div className="h-64">
                <MonthlyCasesBarChart data={monthlyData} />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Column */}
        <div className="lg:col-span-3 space-y-10">
          <NotificationsWidget />
        </div>
      </div>

      {/* Recent Cases Table — full width */}
      <div className="app-card overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold font-display">
            {t('Recent Cases') || 'Recent Cases'}
          </h2>
          <Link
            to="/cases/all"
            className="text-xs font-black uppercase tracking-widest text-[var(--app-accent)] hover:underline"
          >
            {t('Full Registry') || 'Full Registry'}
          </Link>
        </div>

        {casesLoading ? (
          <div className="space-y-4">
            <div className="h-10 w-full bg-[var(--app-panel-muted)] animate-pulse rounded-lg"></div>
            <div className="h-20 w-full bg-[var(--app-panel-muted)] animate-pulse rounded-lg"></div>
          </div>
        ) : (recentCases?.length ?? 0) > 0 ? (
          <Table<RecentCase>
            columns={[
              {
                key: 'case_number',
                label: t('Case Number') || 'Case Number',
                render: (val, row) => String(val || row.case_id),
              },
              {
                key: 'case_type',
                label: t('Case Type') || 'Case Type',
              },
              {
                key: 'plaintiff_name',
                label: t('Plaintiff') || 'Plaintiff',
              },
              {
                key: 'status',
                label: t('Status') || 'Status',
                render: (val) => {
                  const status = String(val);
                  let badgeClass = 'app-badge-neutral';
                  let displayText = translateStatus(status);
                  if (status === 'Registered') badgeClass = 'app-badge-info';
                  else if (status === 'Ongoing') badgeClass = 'app-badge-warning';
                  else if (status === 'Closed') badgeClass = 'app-badge-success';

                  return <span className={`app-badge ${badgeClass}`}>{displayText}</span>;
                },
              },
              {
                key: 'filing_date',
                label: t('Filing Date') || 'Filing Date',
                render: (val) => (
                  <div className="text-right">
                    {new Date(String(val)).toLocaleDateString()}
                  </div>
                ),
              },
            ]}
            data={recentCases ?? []}
            keyField="case_id"
            emptyMessage={t('No Recent Cases') || 'No recent cases found.'}
          />
        ) : (
          <div className="text-center py-10">
            <p className="app-muted">{t('No Recent Cases') || 'No recent cases found.'}</p>
          </div>
        )}
      </div>

      {/* News Widget — full width */}
      <NewsWidget />
    </div>
  );
};

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
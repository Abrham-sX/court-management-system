import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ScaleIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  FolderIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';
import { CaseStatusPieChart } from '../../components/charts/CaseStatusPieChart';
import { MonthlyCasesBarChart } from '../../components/charts/MonthlyCasesBarChart';
import { demoMonthlyData, demoStatusData } from '../../components/charts/chartTheme';
import { NewsWidget } from '../../components/widgets/NewsWidget';
import { NotificationsWidget } from '../../components/widgets/NotificationsWidget';
import { ReportsWidget } from '../../components/widgets/ReportsWidget';
import { useLanguage } from '../../i18n';

interface AdminStats {
  totalCases: number;
  pendingHearings: number;
  totalUsers: number;
  documents: number;
  casesByStatus: { name: string; value: number }[];
  monthlyFilings: { month: string; cases: number }[];
}

const fetchAdminStats = async (): Promise<AdminStats> => {
  const { data } = await apiClient.get('/admin/stats');
  return data;
};

export const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { t } = useLanguage();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchAdminStats,
  });

  const displayStats: AdminStats = stats || {
    totalCases: 0,
    pendingHearings: 0,
    totalUsers: 0,
    documents: 0,
    casesByStatus: [],
    monthlyFilings: [],
  };

  const statusData = displayStats.casesByStatus?.length
    ? displayStats.casesByStatus
    : demoStatusData;

  const monthlyData = displayStats.monthlyFilings?.length
    ? displayStats.monthlyFilings
    : demoMonthlyData;

  // Pre‑translate the "LIVE" label to avoid passing the t function
  const liveLabel = t('live') || 'LIVE';

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-[image:var(--app-sidebar-bg)] p-10 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">
            {t('welcomeBack') || 'Welcome back'}, {user?.full_name || user?.username}
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            {t('adminDashboardWelcomeSub') || 'Monitor court performance, manage cases, and oversee system operations.'}
          </p>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-[var(--app-accent)] opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-black/10 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('totalCases') || 'Total Cases'}
          value={displayStats.totalCases}
          icon={ScaleIcon}
          loading={isLoading}
          liveLabel={liveLabel}
        />
        <StatCard
          title={t('pendingHearings') || 'Pending Hearings'}
          value={displayStats.pendingHearings}
          icon={CalendarIcon}
          loading={isLoading}
          liveLabel={liveLabel}
        />
        <StatCard
          title={t('activeUsers') || 'Active Users'}
          value={displayStats.totalUsers}
          icon={UserGroupIcon}
          loading={isLoading}
          liveLabel={liveLabel}
        />
        <StatCard
          title={t('documents') || 'Documents'}
          value={displayStats.documents}
          icon={DocumentTextIcon}
          loading={isLoading}
          liveLabel={liveLabel}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cases by Status */}
            <div className="app-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-display">
                  {t('caseStatusBreakdown') || 'Case Status Breakdown'}
                </h2>
                <div className="p-2 bg-[var(--app-accent-soft)] rounded-xl">
                  <ChartBarIcon className="h-5 w-5 text-[var(--app-accent)]" />
                </div>
              </div>
              <div className="h-80 flex items-center justify-center">
                {isLoading ? (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-40 w-40 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                  </div>
                ) : (
                  <CaseStatusPieChart data={statusData} />
                )}
              </div>
            </div>

            {/* Monthly Case Filings */}
            <div className="app-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-display">
                  {t('monthlyCaseFilings') || 'Monthly Case Filings'}
                </h2>
                <div className="p-2 bg-[var(--app-accent-soft)] rounded-xl">
                  <CalendarIcon className="h-5 w-5 text-[var(--app-accent)]" />
                </div>
              </div>
              {isLoading ? (
                <div className="animate-pulse w-full h-64 flex items-end justify-between space-x-2">
                  <div className="h-1/2 w-8 bg-gray-200 dark:bg-gray-800 rounded-t-lg"></div>
                  <div className="h-3/4 w-8 bg-gray-200 dark:bg-gray-800 rounded-t-lg"></div>
                  <div className="h-1/4 w-8 bg-gray-200 dark:bg-gray-800 rounded-t-lg"></div>
                  <div className="h-full w-8 bg-gray-200 dark:bg-gray-800 rounded-t-lg"></div>
                </div>
              ) : (
                <div className="w-full">
                  <MonthlyCasesBarChart data={monthlyData} />
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="app-card">
            <div className="flex items-center justify-between mb-8">
              <h2 className="app-heading text-xl font-bold">
                {t('administrativeActions') || 'Administrative Actions'}
              </h2>
              <span className="text-xs uppercase tracking-widest text-[var(--app-muted)]">
                {t('instantAccess') || 'Instant access'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <ActionCard
                to="/admin/users"
                icon={UserGroupIcon}
                label={t('manageUsers') || 'Users'}
              />
              <ActionCard
                to="/admin/logs"
                icon={DocumentTextIcon}
                label={t('systemLogs') || 'Logs'}
              />
              <ActionCard
                to="/admin/backup"
                icon={Cog6ToothIcon}
                label={t('backupData') || 'Backup'}
              />
              <ActionCard
                to="/cases/all"
                icon={FolderIcon}
                label={t('allCases') || 'All Cases'}
              />
              <ActionCard
                to="/hearings/schedule"
                icon={CalendarIcon}
                label={t('scheduleHearing') || 'Schedule'}
              />
              <ActionCard
                to="/cases/register"
                icon={PencilSquareIcon}
                label={t('registerCase') || 'Register'}
              />
            </div>
          </div>

          {/* Premium Announcements Widget */}
          <NewsWidget />
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <NotificationsWidget />
          <ReportsWidget />
        </div>
      </div>
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
      <div className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
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

interface ActionCardProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const ActionCard = ({ to, icon: Icon, label }: ActionCardProps) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center rounded-[24px] bg-[var(--app-panel-soft)] border border-[var(--app-border)] p-5 transition-all duration-300 hover:bg-[var(--app-accent)] group shadow-sm hover:shadow-xl hover:-translate-y-1"
  >
    <div className="mb-3 rounded-2xl bg-white/50 p-3 group-hover:bg-white/20 transition-colors">
      <Icon className="h-6 w-6 text-[var(--app-accent)] group-hover:text-white transition-colors" />
    </div>
    <span className="text-xs font-bold text-center text-[var(--app-text)] group-hover:text-white leading-tight">
      {label}
    </span>
  </Link>
);
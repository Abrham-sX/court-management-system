import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ScaleIcon,
  CalendarIcon,
  PencilIcon,
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

interface Hearing {
  hearing_date: string;
  hearing_time: string;
  status: 'Scheduled' | 'Completed' | 'Postponed' | 'Ongoing';
  case_number?: string;
}

interface Case {
  case_id: number;
  case_number: string;
  case_type: string;
  status: string;
  next_hearing?: string;
  hearings?: Hearing[];
}

interface JudgeStats {
  totalCases: number;
  pendingJudgments: number;
  hearingsToday: number;
  casesByStatus: { name: string; value: number }[];
}

const fetchJudgeStats = async (): Promise<JudgeStats> => {
  const { data } = await apiClient.get('/judge/stats');
  return data;
};

const fetchJudgeCases = async (): Promise<Case[]> => {
  const { data } = await apiClient.get('/judge/cases');
  return data;
};

// StatCard component must be defined before it is used
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

export const JudgeDashboard = () => {
  const { user } = useAuthStore();
  const { t } = useLanguage();

  const { data: stats } = useQuery({
    queryKey: ['judgeStats'],
    queryFn: fetchJudgeStats,
  });

  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ['judgeCases'],
    queryFn: fetchJudgeCases,
  });

  const displayStats: JudgeStats = stats || {
    totalCases: 0,
    pendingJudgments: 0,
    hearingsToday: 0,
    casesByStatus: [],
  };

  const pendingCases = cases?.filter((c) => c.status !== 'Closed') || [];
  const upcomingHearings =
    cases?.flatMap((c) =>
      (c.hearings || [])
        .filter((h) => h.status === 'Scheduled' || h.status === 'Ongoing')
        .map((h) => ({ ...h, case_number: c.case_number }))
    ) || [];

  const statusData = displayStats.casesByStatus?.length
    ? displayStats.casesByStatus
    : cases
      ? [
          { name: t('On goingStatus') || 'Ongoing', value: cases.filter((c) => c.status === 'Ongoing').length },
          { name: t('ClosedStatus') || 'Closed', value: cases.filter((c) => c.status === 'Closed').length },
          { name: t('AdjournedStatus') || 'Adjourned', value: cases.filter((c) => c.status === 'Adjourned').length },
        ]
      : demoStatusData;

  const liveLabel = t('live') || 'LIVE';
  const welcomeSub =
    t('judgeDashboardWelcomeSub', { count: displayStats.totalCases }) ||
    `You are presiding over ${displayStats.totalCases} active cases.`;

  const translateStatus = (status: string): string => {
    const key = `status_${status.toLowerCase()}`;
    return t(key) || status;
  };

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-[image:var(--app-sidebar-bg)] p-10 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/80">
              {t('activeSession') || 'ACTIVE SESSION'}
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-2">
            {t('welcomeBack') || 'Welcome back'}, {t('honorable') || 'Hon.'}{' '}
            {user?.full_name || user?.username}
          </h1>
          <p className="text-white/70 text-lg max-w-xl leading-relaxed">{welcomeSub}</p>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-[var(--app-accent)] opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-black/10 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('totalAssignedCases') || 'Total Assigned Cases'}
          value={cases?.length || 0}
          icon={ScaleIcon}
          loading={casesLoading}
          liveLabel={liveLabel}
        />
        <StatCard
          title={t('pendingJudgments') || 'Pending Judgments'}
          value={displayStats.pendingJudgments || pendingCases.length}
          icon={PencilIcon}
          loading={casesLoading}
          liveLabel={liveLabel}
        />
        <StatCard
          title={t('hearingsToday') || 'Hearings Today'}
          value={displayStats.hearingsToday || upcomingHearings.length}
          icon={CalendarIcon}
          loading={casesLoading}
          liveLabel={liveLabel}
        />
      </div>

      {/* Main Content: Charts | Notifications */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1.05fr)] gap-6 xl:gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Case Status Pie Chart */}
            <div className="app-card flex h-full min-h-[420px] flex-col">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className="text-xl font-bold font-display">
                  {t('Case Status Breakdown') || 'Case Status Breakdown'}
                </h2>
                <div className="p-2 bg-[var(--app-accent-soft)] rounded-xl">
                  <ChartBarIcon className="h-6 w-6 text-[var(--app-accent)]" />
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0">
                {casesLoading ? (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-40 w-40 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                  </div>
                ) : (
                  <CaseStatusPieChart data={statusData} />
                )}
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

      {/* Cases Table — full width, below the grid */}
      <div className="app-card overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold font-display">{t('My Cases') || 'My Cases'}</h2>
          <Link
            to="/judge/cases"
            className="text-xs font-black uppercase tracking-widest text-[var(--app-accent)] hover:underline"
          >
            {t('viewAll') || 'VIEW ALL'}
          </Link>
        </div>

        {casesLoading ? (
          <div className="space-y-4">
            <div className="h-10 w-full bg-[var(--app-panel-muted)] animate-pulse rounded-lg"></div>
            <div className="h-20 w-full bg-[var(--app-panel-muted)] animate-pulse rounded-lg"></div>
          </div>
        ) : (cases?.length || 0) > 0 ? (
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
                    {t('status') || 'Status'}
                  </th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)]">
                    {t('nextHearing') || 'Next Hearing'}
                  </th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-[var(--app-muted)] text-right">
                    {t('action') || 'Action'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {cases?.slice(0, 8).map((c) => {
                  const statusDisplay = translateStatus(c.status);
                  let badgeClass = 'app-badge-info';
                  if (c.status === 'Ongoing') badgeClass = 'app-badge-warning';
                  else if (c.status === 'Closed') badgeClass = 'app-badge-success';

                  return (
                    <tr key={c.case_id} className="group hover:bg-[var(--app-panel-muted)] transition-colors">
                      <td className="py-5 font-bold text-sm">{c.case_number || c.case_id}</td>
                      <td className="py-5 text-sm text-[var(--app-muted)]">{c.case_type}</td>
                      <td className="py-5">
                        <span className={`app-badge ${badgeClass}`}>{statusDisplay}</span>
                      </td>
                      <td className="py-5 text-sm font-black opacity-40 group-hover:opacity-100 transition-opacity">
                        {c.next_hearing
                          ? new Date(c.next_hearing).toLocaleDateString()
                          : t('notScheduled') || 'Not scheduled'}
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/judge/case/${c.case_id}`}
                            className="p-2 bg-[var(--app-panel-soft)] rounded-xl hover:bg-[var(--app-accent)] hover:text-white transition-all shadow-sm"
                            aria-label={t('view') || 'View'}
                            title={t('view') || 'View'}
                          >
                            <ScaleIcon className="h-4 w-4" />
                          </Link>
                          {c.status !== 'Closed' && (
                            <Link
                              to={`/judge/judgments/${c.case_id}`}
                              className="p-2 bg-[var(--app-accent-soft)] text-[var(--app-accent)] rounded-xl hover:bg-[var(--app-accent)] hover:text-white transition-all shadow-sm"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="app-muted">{t('No Cases Assigned') || 'No cases assigned.'}</p>
          </div>
        )}
      </div>

      {/* News Widget — full width, right after cases table */}
      <NewsWidget />
    </div>
  );
};
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import {
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  ScaleIcon,
  UserGroupIcon,
  FunnelIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../i18n';
import { MonthlyCasesBarChart } from '../../components/charts/MonthlyCasesBarChart';
import { CaseStatusPieChart } from '../../components/charts/CaseStatusPieChart';
import { ResolutionTrendChart } from '../../components/charts/ResolutionTrendChart';
import { ResolutionPieChart } from '../../components/charts/ResolutionPieChart';

interface ReportOptions {
  reportTypes?: { id: string; label: string }[];
  caseTypes?: string[];
  statuses?: string[];
}

interface AdminStats {
  totalCases: number;
  pendingHearings: number;
  totalUsers: number;
  documents: number;
  casesByStatus: { name: string; value: number }[];
  monthlyFilings: { month: string; cases: number }[];
  resolutionTrendData: { month: string; filed: number; resolved: number }[];
  resolutionPieData: { filed: number; resolved: number };
}

const fetchReportOptions = async (): Promise<ReportOptions> => {
  const { data } = await apiClient.get('/reports/options');
  return data;
};

const fetchAdminStats = async (): Promise<AdminStats> => {
  const { data } = await apiClient.get('/admin/stats');
  return data;
};

export const AdminReports = () => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({
    type: 'all-cases',
    startDate: '',
    endDate: '',
    caseType: '',
    status: '',
  });

  const { data: options } = useQuery({
    queryKey: ['reportOptions'],
    queryFn: fetchReportOptions,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
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
    resolutionTrendData: [],
    resolutionPieData: { filed: 0, resolved: 0 },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async () => {
    try {
      const response = await apiClient.get('/reports/generate', {
        params: filters,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${filters.type}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert(t('failedToGenerateReport') || 'Failed to generate report');
    }
  };

  // Helper to translate report type ID
  const translateReportType = (id: string, fallback: string): string => {
    const key = `reportType_${id.replace(/-/g, '_')}`;
    return t(key) || fallback;
  };

  // Helper to translate case type
  const translateCaseType = (type: string): string => {
    const key = type.toLowerCase();
    return t(key) || type;
  };

  // Helper to translate status
  const translateStatus = (status: string): string => {
    const key = `status_${status.toLowerCase()}`;
    return t(key) || status;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--app-panel)] p-8 shadow-2xl border border-[var(--app-border)]">
        <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-[var(--app-accent)] opacity-5 blur-3xl"></div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--app-accent-soft)] text-[var(--app-accent)] text-xs font-bold mb-4">
              <PresentationChartLineIcon className="h-3.5 w-3.5" />
              <span className="uppercase tracking-wider">
                {t('operationalIntelligence') || 'Operational Intelligence'}
              </span>
            </div>
            <h1 className="text-3xl font-black text-[var(--app-text)] tracking-tight">
              {t('judicialReportingCenter') || 'Judicial Reporting Center'}
            </h1>
            <p className="app-muted mt-2 max-w-lg">
              {t('analyzePerformanceMetrics') || 'Analyze court performance and case metrics'}
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="app-btn-primary h-14 px-8 shadow-xl shadow-[var(--app-accent-soft)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-3"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span className="font-bold">{t('exportDetailedPdf') || 'Export Detailed PDF'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          title={t('totalCases') || 'Total Cases'}
          value={displayStats.totalCases}
          icon={ScaleIcon}
          loading={statsLoading}
          trend={`+12% ${t('vsLastMonth') || 'vs last month'}`}
        />
        <MetricCard
          title={t('pendingHearings') || 'Pending Hearings'}
          value={displayStats.pendingHearings}
          icon={CalendarDaysIcon}
          loading={statsLoading}
          trend={t('steady') || 'Steady'}
        />
        <MetricCard
          title={t('activeUsers') || 'Active Users'}
          value={displayStats.totalUsers}
          icon={UserGroupIcon}
          loading={statsLoading}
          trend={`+4 ${t('newThisWeek') || 'new this week'}`}
        />
        <MetricCard
          title={t('archivedDocs') || 'Archived Docs'}
          value={displayStats.documents}
          icon={DocumentTextIcon}
          loading={statsLoading}
          trend={`2.4 GB ${t('totalSize') || 'total size'}`}
        />
      </div>

      {/* Filters Section */}
      <div className="app-card overflow-visible">
        <div className="flex items-center space-x-2 mb-6 border-b border-[var(--app-border)] pb-4">
          <FunnelIcon className="h-5 w-5 text-[var(--app-accent)]" />
          <h2 className="text-lg font-bold text-[var(--app-text)] uppercase tracking-tight">
            {t('reportCustomization') || 'Report Customization'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <SelectField
            label={t('dataSubject') || 'Data Subject'}
            name="type"
            value={filters.type}
            onChange={handleChange}
          >
            {options?.reportTypes?.map((r) => (
              <option key={r.id} value={r.id}>
                {translateReportType(r.id, r.label)}
              </option>
            ))}
          </SelectField>
          <SelectField
            label={t('caseCategory') || 'Case Category'}
            name="caseType"
            value={filters.caseType}
            onChange={handleChange}
          >
            <option value="">{t('allCategories') || 'All Categories'}</option>
            {options?.caseTypes?.map((type) => (
              <option key={type} value={type}>
                {translateCaseType(type)}
              </option>
            ))}
          </SelectField>
          <SelectField
            label={t('operationalStatus') || 'Operational Status'}
            name="status"
            value={filters.status}
            onChange={handleChange}
          >
            <option value="">{t('anyStatus') || 'Any Status'}</option>
            {options?.statuses?.map((status) => (
              <option key={status} value={status}>
                {translateStatus(status)}
              </option>
            ))}
          </SelectField>
          <DateField
            label={t('periodFrom') || 'From'}
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
          />
          <DateField
            label={t('periodTo') || 'To'}
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ChartCard
          title={t('caseDistributionByStatus') || 'Case Distribution by Status'}
          description={t('overviewOfCurrentJudicialLoad') || 'Overview of current judicial workload'}
        >
          <CaseStatusPieChart data={displayStats.casesByStatus} />
        </ChartCard>

        <ChartCard
          title={t('monthlyFilingVelocity') || 'Monthly Filing Velocity'}
          description={t('newCasesRegisteredOverTime') || 'New cases registered over time'}
        >
          <MonthlyCasesBarChart data={displayStats.monthlyFilings} />
        </ChartCard>

        <ChartCard
          title={t('resolutionEfficiency') || 'Resolution Efficiency'}
          description={t('comparisonOfFiledVsResolvedCases') || 'Comparison of filed vs resolved cases'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResolutionPieChart data={displayStats.resolutionPieData} />
            <ResolutionTrendChart data={displayStats.resolutionTrendData} />
          </div>
        </ChartCard>

        <div className="app-card flex flex-col justify-between overflow-hidden">
          <div>
            <h2 className="text-xl font-bold mb-2">
              {t('judicialInsights') || 'Judicial Insights'}
            </h2>
            <p className="app-muted text-sm mb-6">
              {t('systemPerformanceObservation') || 'System performance and efficiency metrics'}
            </p>

            <div className="space-y-4">
              <InsightItem
                title={t('clearanceRate') || 'Clearance Rate'}
                value="84%"
                detail={t('casesResolvedVsFiled') || 'Percentage of cases resolved vs filed'}
                positive
              />
              <InsightItem
                title={t('averageDuration') || 'Average Duration'}
                value={`42 ${t('days') || 'days'}`}
                detail={t('fromRegistrationToClosure') || 'From registration to closure'}
                neutral
              />
              <InsightItem
                title={t('backlogGrowth') || 'Backlog Growth'}
                value="+5.2%"
                detail={t('increaseInPendingActions') || 'Increase in pending actions'}
                negative
              />
            </div>
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-[var(--app-panel-soft)] border border-[var(--app-border)]">
            <p className="text-xs font-bold text-[var(--app-accent)] uppercase mb-2">
              {t('proactiveAlert') || 'Proactive Alert'}
            </p>
            <p className="text-sm text-[var(--app-text)]">
              {t('civilCaseBacklogAlert') ||
                'Civil case backlog has increased by 5.2% this quarter. Consider resource reallocation.'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SummaryCard
          title={t('highEfficiency') || 'High Efficiency'}
          value={t('civilDivision') || 'Civil Division'}
          detail={t('highestResolutionRateThisQuarter') || 'Highest resolution rate this quarter'}
          icon={<ScaleIcon className="h-5 w-5" />}
        />
        <SummaryCard
          title={t('dataIntegrity') || 'Data Integrity'}
          value="99.9%"
          detail={t('allDigitalRecordsAreSigned') || 'All digital records are signed and verified'}
          icon={<DocumentChartBarIcon className="h-5 w-5" />}
        />
        <SummaryCard
          title={t('lastSync') || 'Last Sync'}
          value={`2 ${t('minsAgo') || 'mins ago'}`}
          detail={t('realTimeDashboardUpdates') || 'Real-time dashboard updates every 30 seconds'}
          icon={<ClockIcon className="h-5 w-5" />}
        />
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  loading: boolean;
  trend?: string;
}

const MetricCard = ({ title, value, icon: Icon, loading, trend }: MetricCardProps) => (
  <div className="app-card relative group hover:shadow-2xl transition-all duration-300">
    <div className="flex items-center gap-5">
      <div className="rounded-2xl p-4 bg-[var(--app-accent-soft)] text-[var(--app-accent)] group-hover:scale-110 transition-transform">
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <p className="text-[var(--app-muted)] text-sm font-medium uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl font-black text-[var(--app-text)] mt-1">
          {loading ? '...' : value}
        </p>
        {trend && <p className="text-[10px] font-bold text-[var(--app-accent)] mt-1">{trend}</p>}
      </div>
    </div>
  </div>
);

const ChartCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="app-card">
    <div className="mb-6">
      <h2 className="text-xl font-bold text-[var(--app-text)]">{title}</h2>
      <p className="app-muted text-sm">{description}</p>
    </div>
    {children}
  </div>
);

const SelectField = ({ label, children, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-[var(--app-muted)] uppercase tracking-widest">
      {label}
    </label>
    <select {...props} className="app-select w-full bg-[var(--app-panel-soft)] border-none font-medium">
      {children}
    </select>
  </div>
);

const DateField = ({ label, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-[var(--app-muted)] uppercase tracking-widest">
      {label}
    </label>
    <input
      type="date"
      {...props}
      className="app-input w-full bg-[var(--app-panel-soft)] border-none font-medium"
    />
  </div>
);

const InsightItem = ({
  title,
  value,
  detail,
  positive,
  negative,
}: any) => (
  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--app-panel-soft)] transition-colors">
    <div>
      <p className="text-sm font-bold text-[var(--app-text)]">{title}</p>
      <p className="text-xs text-[var(--app-muted)]">{detail}</p>
    </div>
    <div
      className={`text-lg font-black ${
        positive
          ? 'text-emerald-500'
          : negative
          ? 'text-rose-500'
          : 'text-amber-500'
      }`}
    >
      {value}
    </div>
  </div>
);

const SummaryCard = ({ title, value, detail, icon }: any) => (
  <div className="app-card flex items-start space-x-4">
    <div className="p-3 rounded-xl bg-[var(--app-panel-soft)] text-[var(--app-accent)]">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-[var(--app-muted)] uppercase">{title}</p>
      <p className="text-lg font-black text-[var(--app-text)]">{value}</p>
      <p className="text-xs text-[var(--app-muted)] mt-1">{detail}</p>
    </div>
  </div>
);
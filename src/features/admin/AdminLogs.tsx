import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import { AxiosError } from 'axios';
import { Table } from '../../components/Table';
import type { Column } from '../../components/Table';
import { useLanguage } from '../../i18n';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface LogEntry {
  log_id: number;
  timestamp: string;
  username?: string;
  action: string;
  details?: string;
  active_time?: string;
  ip_address?: string;
}

interface LogsResponse {
  logs: LogEntry[];
  total: number;
  hasMore: boolean;
}

const fetchLogs = async (
  page: number,
  action: string,
  search: string,
  date: string,
  name: string,
  role: string
): Promise<LogsResponse> => {
  const { data } = await apiClient.get('/admin/logs', {
    params: {
      page,
      action: action || undefined,
      search: search || undefined,
      date: date || undefined,
      name: name || undefined,
      role: role || undefined,
      limit: 30,
    },
  });
  return data;
};

export const AdminLogs = () => {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [appliedAction, setAppliedAction] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [appliedName, setAppliedName] = useState('');
  const [appliedRole, setAppliedRole] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      'systemLogs',
      page,
      appliedAction,
      '',
      appliedDate,
      appliedName,
      appliedRole,
    ],
    queryFn: () =>
      fetchLogs(page, appliedAction, '', appliedDate, appliedName, appliedRole),
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const hasMore = data?.hasMore;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedAction(actionFilter);
    setAppliedDate(dateFilter);
    setAppliedName(nameFilter);
    setAppliedRole(roleFilter);
    setPage(1);
  };

  const clearSearch = () => {
    setActionFilter('');
    setDateFilter('');
    setNameFilter('');
    setRoleFilter('');

    setAppliedAction('');
    setAppliedDate('');
    setAppliedName('');
    setAppliedRole('');
    setPage(1);
  };

  // Helper to get action badge color
  const getActionColorClass = (action: string): string => {
    const upperAction = action.toUpperCase();
    if (upperAction.includes('CREATE') || upperAction.includes('LOGIN')) {
      return 'bg-emerald-500/20 text-emerald-400';
    }
    if (upperAction.includes('DELETE') || upperAction.includes('LOGOUT')) {
      return 'bg-rose-500/20 text-rose-400';
    }
    if (upperAction.includes('UPDATE')) {
      return 'bg-amber-500/20 text-amber-400';
    }
    if (upperAction.includes('VIEW')) {
      return 'bg-sky-500/20 text-sky-400';
    }
    return 'app-badge-neutral';
  };

  const columns: Column<LogEntry>[] = [
    {
      key: 'timestamp',
      label: t('timestamp') || 'Timestamp',
      sortable: true,
      render: (val) => {
        const d = new Date(String(val));
        return (
          <div className="text-xs uppercase tracking-wide">
            <div className="font-bold">{d.toLocaleDateString()}</div>
            <div className="text-[var(--app-muted)]">{d.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
    {
      key: 'username',
      label: t('username') || 'Username',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-[var(--app-accent)]">
          {String(val || t('system') || 'System')}
        </span>
      ),
    },
    {
      key: 'action',
      label: t('action') || 'Action',
      sortable: true,
      render: (val) => {
        const action = String(val);
        const colorClass = getActionColorClass(action);
        return (
          <span
            className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${colorClass}`}
          >
            {action}
          </span>
        );
      },
    },
    {
      key: 'details',
      label: t('description') || 'Description',
      sortable: false,
      render: (val) => (
        <span className="text-xs text-[var(--app-muted)] max-w-[200px] truncate block">
          {String(val || '—')}
        </span>
      ),
    },
    {
      key: 'ip_address',
      label: t('ipAddress') || 'IP Address',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-mono text-[var(--app-muted)]">
          {String(val || '—')}
        </span>
      ),
    },
  ];

  return (
    <div className="app-card p-6">
      <h1 className="app-heading text-2xl font-bold mb-6 uppercase tracking-tight">
        {t('systemLogsTitle') || 'System Logs'}
      </h1>

      {/* Advanced Search & Filter Bar */}
      <form
        onSubmit={handleSearch}
        className="mb-6 p-4 bg-[var(--app-panel-soft)] rounded-2xl border border-[var(--app-border)] space-y-4 animate-fade-in"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--app-muted)] ml-1 uppercase tracking-widest">
              {t('date') || 'Date'}
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="app-input w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--app-muted)] ml-1 uppercase tracking-widest">
              {t('nameUsername') || 'Name / Username'}
            </label>
            <input
              type="text"
              placeholder={t('searchName') || 'Search by name...'}
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="app-input w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--app-muted)] ml-1 uppercase tracking-widest">
              {t('roleFilter') || 'Role'}
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="app-select w-full"
            >
              <option value="">{t('allRoles') || 'All Roles'}</option>
              <option value="admin">{t('admin') || 'Admin'}</option>
              <option value="judge">{t('judge') || 'Judge'}</option>
              <option value="clerk">{t('clerk') || 'Clerk'}</option>
              <option value="lawyer">{t('lawyer') || 'Lawyer'}</option>
              <option value="user">{t('publicUser') || 'Public User'}</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--app-muted)] ml-1 uppercase tracking-widest">
              {t('action') || 'Action'}
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="app-select w-full"
            >
              <option value="">{t('allActions') || 'All Actions'}</option>
              <option value="LOGIN">{t('login') || 'Login'}</option>
              <option value="LOGOUT">{t('logout') || 'Logout'}</option>
              <option value="CREATE">{t('register') || 'Register'}</option>
              <option value="UPDATE">{t('updateJudgment') || 'Update'}</option>
              <option value="DELETE">{t('cancel') || 'Delete'}</option>
              <option value="VIEW">{t('view') || 'View'}</option>
              <option value="UPLOAD">{t('uploadEvidence') || 'Upload Evidence'}</option>
              <option value="COMPLAINT">{t('fileComplaint') || 'File Complaint'}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-[var(--app-border)] pt-4 mt-2 gap-4">
          <span className="app-muted text-sm font-bold uppercase tracking-widest">
            {t('allRecordsFound') || `Total records: ${total}`}
          </span>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={clearSearch}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-[var(--app-text)] opacity-60 bg-[var(--app-panel-muted)] hover:opacity-100 hover:bg-[var(--app-border)] transition-all flex items-center justify-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" /> {t('clearFilters') || 'Clear'}
            </button>
            <button
              type="submit"
              className="flex-1 md:flex-none app-btn-primary px-8 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2"
            >
              <MagnifyingGlassIcon className="w-4 h-4" /> {t('searchLogs') || 'Search'}
            </button>
          </div>
        </div>
      </form>

      {isLoading ? (
        <p className="app-muted">{t('loading') || 'Loading...'}</p>
      ) : isError ? (
        <div className="app-alert-error">
          {(error as AxiosError<{ message?: string }>)?.response?.data?.message ||
            t('error') ||
            'An error occurred'}
        </div>
      ) : (
        <>
          <Table<LogEntry>
            columns={columns}
            data={logs}
            keyField="log_id"
            emptyMessage={t('noLogsFound') || 'No logs found'}
          />

          {/* Pagination */}
          <div
            className="flex justify-between items-center mt-4 pt-4 border-t"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="app-btn-secondary"
            >
              {t('previous') || 'Previous'}
            </button>
            <span className="app-muted text-sm font-bold uppercase tracking-widest">
              {t('page') || 'Page'} {page}
            </span>
            <button
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="app-btn-secondary"
            >
              {t('next') || 'Next'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
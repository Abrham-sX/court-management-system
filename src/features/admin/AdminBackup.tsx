import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  ServerIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../i18n';
import { Table } from '../../components/Table';
import type { Column } from '../../components/Table';

interface BackupFile {
  filename: string;
  size: number;
  createdAt: string;
}

export const AdminBackup = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: backups, isLoading } = useQuery({
    queryKey: ['adminBackups'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/backups');
      return data as BackupFile[];
    },
  });

  const createMutation = useMutation({
    mutationFn: () => apiClient.post('/admin/backup'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBackups'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (filename: string) => apiClient.delete(`/admin/backups/${filename}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBackups'] }),
  });

  const handleDownload = async (filename: string) => {
    try {
      const response = await apiClient.get(`/admin/backups/${filename}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const columns: Column<BackupFile>[] = [
    {
      key: 'filename',
      label: t('filename') || 'Filename',
      render: (val) => (
        <div className="flex items-center gap-2">
          <ArchiveBoxIcon className="h-4 w-4 app-muted" />
          <span className="font-medium text-sm">{String(val)}</span>
        </div>
      ),
    },
    {
      key: 'size',
      label: t('size') || 'Size',
      render: (val) => <span className="text-sm app-muted">{formatSize(Number(val))}</span>,
    },
    {
      key: 'createdAt',
      label: t('date') || 'Date',
      render: (val) => (
        <span className="text-sm app-muted">{new Date(String(val)).toLocaleString()}</span>
      ),
    },
    {
      key: 'filename',
      label: t('actions') || 'Actions',
      render: (val) => (
        <div className="flex gap-3">
          <button
            onClick={() => handleDownload(String(val))}
            className="text-emerald-500 hover:text-emerald-700 transition-colors"
            title={t('download') || 'Download'}
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              if (confirm(t('confirmDeleteBackup') || 'Are you sure you want to delete this backup?')) {
                deleteMutation.mutate(String(val));
              }
            }}
            className="text-rose-500 hover:text-rose-700 transition-colors"
            title={t('delete') || 'Delete'}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  const totalStorage = backups?.reduce((acc, curr) => acc + curr.size, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="app-card p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <ServerIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest app-muted">
              {t('storageUsed') || 'Storage Used'}
            </p>
            <p className="text-xl font-black">{formatSize(totalStorage)}</p>
          </div>
        </div>

        <div className="app-card p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <ClockIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest app-muted">
              {t('lastBackup') || 'Last Backup'}
            </p>
            <p className="text-xl font-black">
              {backups?.[0]
                ? new Date(backups[0].createdAt).toLocaleDateString()
                : t('none') || '--'}
            </p>
          </div>
        </div>

        <div className="app-card p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <ShieldCheckIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest app-muted">
              {t('systemHealth') || 'System Health'}
            </p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xl font-black">{t('protected') || 'Protected'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="app-card p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="app-heading text-2xl font-bold mb-1">
              {t('dataIntegrityCenter') || 'Data Integrity Center'}
            </h1>
            <p className="app-muted text-sm">
              {t('backupSubtitle') || 'Manage and restore database backups'}
            </p>
          </div>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="app-btn-primary flex items-center gap-2 px-6 py-3"
          >
            <ArchiveBoxIcon className="h-5 w-5" />
            {createMutation.isPending
              ? t('processing') || 'Processing...'
              : t('createManualBackup') || 'Create Manual Backup'}
          </button>
        </div>

        <div className="app-panel-soft rounded-2xl p-4 mb-8 flex items-center gap-4 border border-[var(--app-border)]">
          <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-500">
            <CheckCircleIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">{t('autoBackupActive') || 'Auto-backup active'}</p>
            <p className="text-xs app-muted">
              {t('nextBackupAt') || 'Next backup scheduled for 02:00 AM daily'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-[var(--app-accent)] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="app-muted">
              {t('loadingBackupHistory') || 'Loading backup history...'}
            </p>
          </div>
        ) : (
          <Table<BackupFile>
            columns={columns}
            data={backups ?? []}
            keyField="filename"
            emptyMessage={t('noBackupsFound') || 'No backups found'}
          />
        )}
      </div>
    </div>
  );
};
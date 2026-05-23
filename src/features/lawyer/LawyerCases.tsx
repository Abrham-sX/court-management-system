import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';
import { Table } from '../../components/Table';
import type { Column } from '../../components/Table';

interface Case {
  case_id: number;
  case_number: string;
  case_type: string;
  client_name?: string;
  plaintiff_name: string;
  status: string;
  next_hearing?: string;
}

export const LawyerCases = () => {
  const { t } = useLanguage();
  const { data: cases, isLoading } = useQuery({
    queryKey: ['lawyerCases'],
    queryFn: async (): Promise<Case[]> => (await apiClient.get('/lawyer/cases')).data,
  });

  // Helper to translate status
  const translateStatus = (status: string): string => {
    const key = `status_${status.toLowerCase()}`;
    return t(key) || status;
  };

  const columns: Column<Case>[] = [
    {
      key: 'case_number',
      label: t('caseNumber') || 'Case Number',
      sortable: true,
    },
    {
      key: 'case_type',
      label: t('caseType') || 'Case Type',
      sortable: true,
    },
    {
      key: 'client_name',
      label: t('client') || 'Client',
      sortable: true,
      render: (_, row) => row.client_name || row.plaintiff_name,
    },
    {
      key: 'status',
      label: t('status') || 'Status',
      sortable: true,
      render: (val) => translateStatus(String(val)),
    },
    {
      key: 'next_hearing',
      label: t('nextHearing') || 'Next Hearing',
      sortable: true,
      render: (val) =>
        val
          ? new Date(String(val)).toLocaleDateString()
          : t('notScheduled') || 'TBD',
    },
    {
      key: 'case_id',
      label: t('actions') || 'Actions',
      render: (val) => (
        <div className="flex flex-wrap gap-3">
          <Link to={`/cases/${val}`} className="app-link font-bold">
            {t('view') || 'View'}
          </Link>
          <Link
            to={`/cases/${val}/complaint`}
            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
          >
            {t('fileComplaint') || 'File Complaint'}
          </Link>
          <Link
            to={`/cases/${val}/upload-evidence`}
            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
          >
            {t('uploadEvidence') || 'Upload Evidence'}
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="app-form-shell">
      <h1 className="text-2xl font-bold mb-6">
        {t('myCases') || 'My Cases'}
      </h1>
      {isLoading ? (
        <p className="app-muted">{t('loading') || 'Loading...'}</p>
      ) : (
        <Table<Case>
          columns={columns}
          data={cases ?? []}
          keyField="case_id"
          emptyMessage={t('noCasesFound') || 'No cases found.'}
        />
      )}
    </div>
  );
};
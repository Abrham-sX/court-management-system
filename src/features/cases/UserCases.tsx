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
  plaintiff_name: string;
  defendant_name: string;
  status: string;
  filing_date: string;
  judge?: {
    full_name: string;
  };
}

export const UserCases = () => {
  const { t } = useLanguage();

  const { data: cases, isLoading } = useQuery({
    queryKey: ['userCases'],
    queryFn: async (): Promise<Case[]> => (await apiClient.get('/cases/my')).data,
  });

  // Helper to translate status with color classes mapping
  const getStatusColorClass = (status: string): string => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'open' || lowerStatus === 'registered') {
      return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    }
    if (lowerStatus === 'closed') {
      return 'bg-green-500/10 text-green-500 border border-green-500/20';
    }
    return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
  };

  const translateStatus = (status: string): string => {
    const key = `status_${status.toLowerCase()}`;
    return t(key) || status;
  };

  const translateCaseType = (caseType: string): string => {
    const key = caseType.toLowerCase();
    return t(key) || caseType;
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
      render: (val) => translateCaseType(String(val)),
    },
    {
      key: 'plaintiff_name',
      label: t('plaintiffName') || 'Plaintiff',
      sortable: true,
    },
    {
      key: 'defendant_name',
      label: t('defendantName') || 'Defendant',
      sortable: true,
    },
    {
      key: 'status',
      label: t('status') || 'Status',
      sortable: true,
      render: (val) => (
        <span className={`capitalize font-bold text-xs px-2.5 py-1 rounded-full ${getStatusColorClass(String(val))}`}>
          {translateStatus(String(val))}
        </span>
      ),
    },
    {
      key: 'filing_date',
      label: t('filingDate') || 'Filing Date',
      sortable: true,
      render: (val) => (val ? new Date(String(val)).toLocaleDateString() : 'TBD'),
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
      <h1 className="text-2xl font-bold mb-6">{t('myCases') || 'My Cases'}</h1>
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
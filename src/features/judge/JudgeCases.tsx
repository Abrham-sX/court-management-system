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
  status: string;
  next_hearing?: string;
}

const fetchJudgeCases = async (): Promise<Case[]> => {
  const { data } = await apiClient.get('/judge/cases');
  return data;
};

export const JudgeCases = () => {
  const { t } = useLanguage();
  const { data: cases, isLoading } = useQuery({
    queryKey: ['judgeCases'],
    queryFn: fetchJudgeCases,
  });

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
        val ? new Date(String(val)).toLocaleDateString() : t('notScheduled') || 'Not scheduled',
    },
    {
      key: 'actions',
      label: t('actions') || 'Actions',
      render: (_, row) => (
        <Link to={`/judge/case/${row.case_id}`} className="app-link font-bold">
          {t('view') || 'View'}
        </Link>
      ),
    },
  ];

  return (
    <div className="app-form-shell">
      <h1 className="text-2xl font-bold mb-6">
        {t('assignedCases') || 'Assigned Cases'}
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
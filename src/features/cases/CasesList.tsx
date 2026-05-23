import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
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
}

interface CasesResponse {
  cases: Case[];
  hasMore: boolean;
}

const fetchCases = async (
  page: number,
  status: string,
  search: string
): Promise<CasesResponse> => {
  const { data } = await apiClient.get('/cases', { params: { page, status, search } });
  return data;
};

const STATUS_CLASSES: Record<string, string> = {
  Registered: 'app-badge-info',
  Ongoing: 'app-badge-warning',
  Closed: 'app-badge-success',
  Open: 'app-badge-info',
  Pending: 'app-badge-warning',
};

export const CasesList = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['cases', page, status, search],
    queryFn: () => fetchCases(page, status, search),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // Helper to translate status string
  const translateStatus = (statusValue: string): string => {
    const key = `status_${statusValue.toLowerCase()}`;
    return t(key) || statusValue;
  };

  const columns: Column<Case>[] = [
    {
      key: 'case_number',
      label: t('caseNumber') || 'Case Number',
      sortable: true,
      render: (val, row) => String(val || row.case_id),
    },
    {
      key: 'case_type',
      label: t('caseType') || 'Case Type',
      sortable: true,
    },
    {
      key: 'plaintiff_name',
      label: t('plaintiff') || 'Plaintiff',
      sortable: true,
    },
    {
      key: 'defendant_name',
      label: t('defendant') || 'Defendant',
      sortable: true,
    },
    {
      key: 'status',
      label: t('status') || 'Status',
      sortable: true,
      render: (val) => (
        <span
          className={`app-badge ${STATUS_CLASSES[String(val)] ?? 'app-badge-neutral'}`}
        >
          {translateStatus(String(val))}
        </span>
      ),
    },
    {
      key: 'filing_date',
      label: t('filingDate') || 'Filing Date',
      sortable: true,
      render: (val) => new Date(String(val)).toLocaleDateString(),
    },
    {
      key: 'case_id',
      label: t('action') || 'Action',
      sortable: false,
      render: (val) => (
        <Link to={`/cases/${val}`} className="app-link">
          {t('view') || 'View'}
        </Link>
      ),
    },
  ];

  return (
    <div className="app-form-shell">
      <h1 className="text-2xl font-bold mb-6">{t('allCases') || 'All Cases'}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="app-select !w-auto !py-2"
        >
          <option value="">{t('allStatus') || 'All Status'}</option>
          <option value="Registered">{t('registeredStatus') || 'Registered'}</option>
          <option value="Ongoing">{t('ongoingStatus') || 'Ongoing'}</option>
          <option value="Closed">{t('closedStatus') || 'Closed'}</option>
        </select>

        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder={t('searchCase') || 'Search case...'}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="app-input w-64 rounded-r-none !py-2"
          />
          <button type="submit" className="app-btn-primary rounded-l-none">
            {t('search') || 'Search'}
          </button>
        </form>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="app-muted">{t('loading') || 'Loading...'}</p>
      ) : (
        <>
          <Table<Case>
            columns={columns}
            data={data?.cases ?? []}
            keyField="case_id"
            emptyMessage={t('noCasesFound') || 'No cases found.'}
            onRowClick={(row) => navigate(`/cases/${row.case_id}`)}
          />

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="app-btn-secondary disabled:opacity-50"
            >
              {t('previous') || 'Previous'}
            </button>
            <span className="app-muted">
              {t('page') || 'Page'} {page}
            </span>
            <button
              disabled={!data?.hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="app-btn-secondary disabled:opacity-50"
            >
              {t('next') || 'Next'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
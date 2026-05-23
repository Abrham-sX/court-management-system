import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') return <ChevronUp size={14} className="opacity-100" style={{ color: 'var(--app-accent)' }} />;
  if (direction === 'desc') return <ChevronDown size={14} className="opacity-100" style={{ color: 'var(--app-accent)' }} />;
  return <ChevronsUpDown size={14} className="opacity-40" />;
}

export function Table<T>({ columns, data, keyField, emptyMessage = 'No records found.', onRowClick }: TableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: keyof T) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else if (sortDirection === 'desc') {
      setSortKey(null);
      setSortDirection(null);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  return (
    <div className="w-full overflow-x-auto rounded-xl border shadow-sm" style={{ borderColor: 'var(--app-border)' }}>
      <table className="w-full text-sm text-left">

        {/* Header */}
        <thead className="text-white uppercase text-[10px] font-black tracking-widest" style={{ background: 'var(--app-accent)' }}>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 whitespace-nowrap ${
                  col.sortable ? 'cursor-pointer select-none hover:brightness-110 transition-colors' : ''
                }`}
                onClick={() => col.sortable && handleSort(col.key as keyof T)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <SortIcon direction={sortKey === col.key ? sortDirection : null} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y" style={{ background: 'var(--app-panel)', borderColor: 'var(--app-border)', color: 'var(--app-text)' }}>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm opacity-50"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr
                key={String(row[keyField])}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-[var(--app-accent-soft)]' : 'hover:bg-[var(--app-panel-soft)]'}`}
                onClick={(e) => {
                  if (onRowClick) {
                    const target = e.target as HTMLElement;
                    if (
                      target.tagName === 'A' || 
                      target.tagName === 'BUTTON' || 
                      target.closest('a') || 
                      target.closest('button')
                    ) {
                      return;
                    }
                    onRowClick(row);
                  }
                }}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 whitespace-nowrap">
                    {col.render
                      ? col.render(row[col.key as keyof T], row)
                      : String(row[col.key as keyof T] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
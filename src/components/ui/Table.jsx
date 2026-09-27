import React, { useState, useMemo } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { TableSkeleton } from './Loader';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records match the current view criteria.',
  onRowClick,
  stickyHeader = false,
  className = '',
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av ?? '').localeCompare(String(bv ?? ''))
        : String(bv ?? '').localeCompare(String(av ?? ''));
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className={`border-b border-light-border dark:border-dark-border bg-light-surface/70 dark:bg-dark-surface/70 ${stickyHeader ? 'sticky top-0 z-10 backdrop-blur-sm' : ''}`}>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-[11px] font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider
                  ${col.sortable ? 'cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary select-none' : ''}`}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <div className="flex items-center gap-1.5">
                  <span>{col.label}</span>
                  {col.sortable && (
                    <span className="flex flex-col">
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <FiChevronUp className="w-3 h-3 text-primary" /> : <FiChevronDown className="w-3 h-3 text-primary" />
                      ) : (
                        <FiChevronDown className="w-3 h-3 opacity-30" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-light-border dark:divide-dark-border">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                <TableSkeleton rows={5} cols={columns.length} />
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-xs text-light-text-muted dark:text-dark-text-muted font-normal">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, i) => (
              <tr
                key={row.id ?? i}
                onClick={() => onRowClick?.(row)}
                className={`h-11 transition-colors duration-150 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-light-surface dark:hover:bg-dark-surface'
                    : 'hover:bg-light-surface/50 dark:hover:bg-dark-surface/50'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-2.5 text-xs text-light-text-primary dark:text-dark-text-primary font-normal"
                  >
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

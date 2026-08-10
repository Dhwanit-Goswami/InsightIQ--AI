import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
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

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-[11px] font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider
                  ${col.sortable ? 'cursor-pointer hover:text-light-text-primary dark:hover:text-dark-text-primary select-none' : ''}`}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="ml-1 flex flex-col opacity-50">
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <FiChevronUp className="w-3 h-3 text-primary" /> : <FiChevronDown className="w-3 h-3 text-primary" />
                      ) : (
                        <FiChevronUp className="w-3 h-3" />
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
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 rounded shimmer" style={{ width: `${60 + Math.random() * 30}%` }} />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-xs text-light-text-muted dark:text-dark-text-muted font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-light-surface dark:hover:bg-dark-surface' : 'hover:bg-light-surface/40 dark:hover:bg-dark-surface/40'}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-xs text-light-text-primary dark:text-dark-text-primary font-medium">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
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

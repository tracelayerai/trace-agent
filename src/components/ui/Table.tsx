import type { ReactNode } from 'react';

export interface Column<T> {
  key: keyof T & string;
  label: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  flaggedRowIds?: string[];
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export const Table = <T extends Record<string, unknown>>({
  columns,
  data,
  flaggedRowIds = [],
  rowClassName,
  onRowClick,
  className = '',
}: TableProps<T>) => {
  return (
    <div className={`border border-border rounded-xl overflow-hidden ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="bg-page border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-600 text-text-secondary uppercase tracking-wide"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-border last:border-0 transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-page' : 'hover:bg-gray-50'
              } ${
                flaggedRowIds.includes(row.id as string) ? 'border-l-4 border-l-status-reopened' : ''
              } ${rowClassName ? rowClassName(row) : ''}`}
            >
              {columns.map((column) => (
                <td
                  key={`${rowIndex}-${column.key}`}
                  className="px-4 py-3 text-sm text-text-primary"
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : (row[column.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RowData = Record<string, unknown>;

interface Column<T extends RowData = RowData> {
  key: string;
  label: string;
  type?: string;
  render?: (value: unknown, row: T) => ReactNode;
  width?: number | string;
}

const RISK_COLORS: Record<string, string> = {
  Critical: '#EF4444',
  High:     '#F97316',
  Medium:   '#F59E0B',
  Low:      '#22C55E',
};

export function renderCellByType(type: string | undefined, value: unknown): ReactNode {
  if (!type) {
    return <span className="text-[13px] text-[#374151]">{String(value ?? '')}</span>;
  }

  if (type === 'riskDot') {
    const dotColor = RISK_COLORS[String(value)] ?? '#9CA3AF';
    return (
      <span className="inline-flex items-center gap-[6px]">
        <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: dotColor }} />
        <span className="text-[13px] font-medium text-[#374151]">{String(value ?? '')}</span>
      </span>
    );
  }

  if (type === 'monoId') {
    return <span className="text-[13px] font-mono font-semibold text-[#1A1F35]">{String(value ?? '—')}</span>;
  }

  if (type === 'mono') {
    return <span className="text-[12px] font-mono font-medium text-[#374151]">{String(value ?? '—')}</span>;
  }

  if (type === 'muted') {
    return <span className="text-[12px] text-[#9CA3AF]">{String(value ?? '—')}</span>;
  }

  return <span className="text-[13px] text-[#374151]">{String(value ?? '—')}</span>;
}

interface TableProps<T extends RowData = RowData> {
  columns: Column<T>[];
  data: T[];
  flaggedRowIds?: (string | number)[];
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
  density?: 'compact' | 'relaxed';
  className?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
}

const HEADER_PADDING = { compact: '10px 14px', relaxed: '12px 16px' };
const ROW_PADDING    = { compact: '11px 14px', relaxed: '14px 16px' };

export function Table<T extends RowData = RowData>({
  columns,
  data,
  flaggedRowIds = [],
  rowClassName,
  onRowClick,
  density = 'compact',
  className = '',
  emptyTitle = 'No results found',
  emptySubtitle = 'Try adjusting your filters or search terms',
}: TableProps<T>) {
  const hPad = HEADER_PADDING[density];
  const rPad = ROW_PADDING[density];

  return (
    <div className={cn('rounded-[10px] border border-[#ECEEF2] bg-white overflow-hidden', className)}>
      <table className="w-full border-collapse">
        <thead className="bg-[#F9FAFB]">
          <tr className="border-b border-[#ECEEF2]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-[11px] font-bold uppercase tracking-[0.07em] text-[#9CA3AF] whitespace-nowrap"
                style={{ padding: hPad, width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="flex flex-col items-center justify-center gap-[10px] py-[48px] px-[24px]">
                  <div className="w-[44px] h-[44px] rounded-full bg-[#F3F4F6] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#9CA3AF]">
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M8.5 11h5M11 8.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
                    </svg>
                  </div>
                  <p className="text-[14px] font-semibold text-[#374151] m-0 text-center">{emptyTitle}</p>
                  <p className="text-[12px] text-[#9CA3AF] m-0 text-center">{emptySubtitle}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onMouseEnter={e => { e.currentTarget.style.background = '#F8F9FB'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                onMouseDown={e => { if (onRowClick) e.currentTarget.style.background = '#DBEAFE'; }}
                onMouseUp={e => { if (onRowClick) e.currentTarget.style.background = '#F8F9FB'; }}
                className={cn(
                  'border-b border-[#ECEEF2] last:border-b-0',
                  'transition-colors duration-100',
                  onRowClick ? 'cursor-pointer' : 'cursor-default',
                  flaggedRowIds.includes(row.id as string | number) && 'border-l-4 border-l-[#F59E0B]',
                  rowClassName ? rowClassName(row) : '',
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: rPad }}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : renderCellByType(col.type, row[col.key])}
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

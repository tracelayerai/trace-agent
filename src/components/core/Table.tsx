import type { ReactNode, CSSProperties } from 'react';
import { TABLE, EMPTY_STATE } from '@/tokens/designTokens';

type RowData = Record<string, unknown>;

interface Column<T extends RowData = RowData> {
  key: string;
  label: string;
  type?: string;
  render?: (value: unknown, row: T) => ReactNode;
  width?: number | string;
}

export function renderCellByType(type: string | undefined, value: unknown): ReactNode {
  const tableTokens = TABLE as unknown as {
    cell: {
      plain: CSSProperties;
      riskDot: { colors: Record<string, string>; defaultColor: string; gap: number; dotSize: number; text: CSSProperties };
      [key: string]: CSSProperties | { colors: Record<string, string>; defaultColor: string; gap: number; dotSize: number; text: CSSProperties };
    };
  };

  if (!type) return <span style={tableTokens.cell.plain}>{String(value ?? '')}</span>;

  if (type === 'riskDot') {
    const t = tableTokens.cell.riskDot;
    const dotColor = t.colors[String(value)] ?? t.defaultColor;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: t.gap }}>
        <span style={{ width: t.dotSize, height: t.dotSize, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <span style={t.text}>{String(value ?? '')}</span>
      </span>
    );
  }

  const cellStyle = (tableTokens.cell[type] ?? tableTokens.cell.plain) as CSSProperties;
  return <span style={cellStyle}>{String(value ?? '—')}</span>;
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
  const tableTokens = TABLE as unknown as {
    borderRadius: number | string;
    border: string;
    bg: string;
    header: { bg: string; borderBottom: string; fontSize: number; fontWeight: number; color: string; letterSpacing: string; textTransform: CSSProperties['textTransform'] };
    density: Record<string, { headerPadding: string; rowPadding: string }>;
    row: { hoverBg: string; pressedBg: string; borderBottom: string; fontSize: number; color: string };
  };
  const emptyState = EMPTY_STATE as unknown as {
    wrapper: CSSProperties;
    icon: { size: number; color: string };
    title: CSSProperties;
    subtitle: CSSProperties;
  };

  const d = tableTokens.density[density] ?? tableTokens.density['compact'];

  return (
    <div
      className={className}
      style={{ borderRadius: tableTokens.borderRadius, border: tableTokens.border, background: tableTokens.bg, overflow: 'hidden' }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: tableTokens.header.bg }}>
          <tr style={{ borderBottom: tableTokens.header.borderBottom }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding:       d.headerPadding,
                  textAlign:     'left',
                  fontSize:      tableTokens.header.fontSize,
                  fontWeight:    tableTokens.header.fontWeight,
                  color:         tableTokens.header.color,
                  letterSpacing: tableTokens.header.letterSpacing,
                  textTransform: tableTokens.header.textTransform,
                  whiteSpace:    'nowrap',
                  width:         col.width,
                }}
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
                <div style={emptyState.wrapper}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width={emptyState.icon.size} height={emptyState.icon.size} viewBox="0 0 24 24" fill="none" style={{ color: emptyState.icon.color }}>
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M8.5 11h5M11 8.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
                    </svg>
                  </div>
                  <p style={emptyState.title}>{emptyTitle}</p>
                  <p style={emptyState.subtitle}>{emptySubtitle}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onMouseEnter={e => { e.currentTarget.style.background = tableTokens.row.hoverBg; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                onMouseDown={e => { if (onRowClick) e.currentTarget.style.background = tableTokens.row.pressedBg; }}
                onMouseUp={e => { if (onRowClick) e.currentTarget.style.background = tableTokens.row.hoverBg; }}
                style={{ borderBottom: tableTokens.row.borderBottom }}
                className={`
                  ${onRowClick ? 'cursor-pointer' : ''}
                  ${flaggedRowIds.includes(row.id as string | number) ? 'border-l-4 border-l-status-reopened' : ''}
                  ${rowClassName ? rowClassName(row) : ''}
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ padding: d.rowPadding, fontSize: tableTokens.row.fontSize, color: tableTokens.row.color }}
                  >
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

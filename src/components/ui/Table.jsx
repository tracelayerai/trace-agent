export const Table = ({ columns, data, flaggedRowIds = [], onRowClick, className = '' }) => {
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
                flaggedRowIds.includes(row.id) ? 'border-l-4 border-l-status-reopened' : ''
              }`}
            >
              {columns.map((column) => (
                <td
                  key={`${rowIndex}-${column.key}`}
                  className="px-4 py-3 text-sm text-text-primary"
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

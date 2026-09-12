export function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${row.join('-')}`}>
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`}>
                  {['Confirmed', 'Active'].includes(cell) && (
                    <span className="status-chip success">{cell}</span>
                  )}
                  {['Pending', 'Paused'].includes(cell) && (
                    <span className="status-chip pending">{cell}</span>
                  )}
                  {cell === 'Cancelled' && <span className="status-chip failed">{cell}</span>}
                  {!['Confirmed', 'Active', 'Pending', 'Paused', 'Cancelled'].includes(cell) &&
                    cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

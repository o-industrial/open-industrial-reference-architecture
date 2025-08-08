import type { FunctionalComponent } from 'preact';
import { useEffect, useState } from '../../.deps.ts';

type Row = Record<string, unknown>;

type FlatPrimitive = string | number | boolean | null;
type FlatRow = Record<string, FlatPrimitive>;

interface SurfaceWarmQueryModalResultsProps {
  isLoading: boolean;
  queryName: string;
  queryResults: Row[]; // ← no `any[]`
}

// Narrower object check (ignore arrays)
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// Coerce values into a flat primitive suitable for table/CSV cells
const coerceCell = (v: unknown): FlatPrimitive => {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
  // Dates, arrays, objects, etc → JSON
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

// One-level flatten: parent.child for nested objects
const flattenObject = (obj: Row): FlatRow => {
  const out: FlatRow = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isPlainObject(value)) {
      for (const [k, v] of Object.entries(value)) {
        out[`${key}.${k}`] = coerceCell(v);
      }
    } else {
      out[key] = coerceCell(value);
    }
  }
  return out;
};

export const SurfaceWarmQueryModalResults: FunctionalComponent<
  SurfaceWarmQueryModalResultsProps
> = ({ isLoading, queryName, queryResults }) => {
  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when new results come in
  useEffect(() => {
    setCurrentPage(1);
  }, [queryResults]);

  const totalPages = Math.ceil(queryResults.length / rowsPerPage);

  // Paginate then flatten (so headers match visible rows)
  const paginatedResults: FlatRow[] = queryResults
    .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    .map(flattenObject);

  const columnHeaders: string[] =
    paginatedResults.length > 0 ? Object.keys(paginatedResults[0]) : [];

  const handleExportToCSV = (): void => {
    if (!queryResults.length) return;

    // Flatten all results for the export
    const flattened: FlatRow[] = queryResults.map(flattenObject);

    // Collect all unique headers across all rows
    const allKeys = new Set<string>();
    for (const row of flattened) {
      for (const k of Object.keys(row)) allKeys.add(k);
    }
    const headers = Array.from(allKeys);

    // CSV rows (escape quotes, stringify primitives)
    const csvRows: string[] = [
      headers.join(','), // header
      ...flattened.map((row) =>
        headers
          .map((field) => {
            const value = row[field];
            const str = value === null ? '' : String(value);
            // escape double quotes per RFC 4180
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${queryName || 'query'}-results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div class="pl-6 pr-6 pt-6 pb-0 rounded-sm">
      <div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold">
              Results
            </label>

            <a
              title="Download CSV"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleExportToCSV();
              }}
              class="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8zm4 18H6V4h7v5h5zm-8-1l2-4H9v-5h6v5l-2 4z" />
              </svg>
              <span class="text-sm">CSV</span>
            </a>
          </div>

          {isLoading ? (
            <div class="flex items-center justify-center h-40">
              <div class="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
            </div>
          ) : queryResults.length > 0 ? (
            <div>
              <table class="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
                <thead>
                  <tr class="bg-gray-100 dark:bg-slate-700">
                    {columnHeaders.map((header) => (
                      <th
                        key={header}
                        class="border px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((row, rowIndex) => (
                    <tr key={rowIndex} class="border-t">
                      {columnHeaders.map((header) => (
                        <td key={header} class="border px-3 py-2 text-xs">
                          {row[header] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div class="flex justify-center items-center mt-4 space-x-4">
                <button
                type="button"
                  class="px-3 py-1 bg-gray-300 dark:bg-slate-700 text-sm rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                <span class="text-sm">Page {currentPage} of {Math.max(totalPages, 1)}</span>

                <button
                type="button"
                  class="px-3 py-1 bg-gray-300 dark:bg-slate-700 text-sm rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p class="text-gray-600 dark:text-gray-300 mb-6">No results to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

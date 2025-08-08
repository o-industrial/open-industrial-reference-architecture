import type { FunctionalComponent, JSX } from 'preact';
import { useEffect, useState } from '../../.deps.ts';

interface SurfaceWarmQueryModalResultsProps {
  isLoading: boolean;
  queryName: string;
  queryResults: any[];
}

export const SurfaceWarmQueryModalResults: FunctionalComponent<SurfaceWarmQueryModalResultsProps> =
  ({
    isLoading,
    queryName,
    queryResults,
  }) => {
    const rowsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
      setCurrentPage(1);
    }, [queryResults]);

    const totalPages = Math.ceil(queryResults.length / rowsPerPage);

    const flattenObject = (obj: any) => {
      const result: Record<string, any> = {};
      for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          for (const nestedKey in value) {
            result[`${key}.${nestedKey}`] = value[nestedKey];
          }
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    const paginatedResults = queryResults
      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
      .map(flattenObject);

    const columnHeaders = paginatedResults.length > 0 ? Object.keys(paginatedResults[0]) : [];
    const flattenedResults = paginatedResults;

    const handleExportToCSV = () => {
      if (!queryResults.length) return;

      const flattened = queryResults.map((row: any) => flattenObject(row));
      const allKeys = new Set<string>();
      flattened.forEach((row) => Object.keys(row).forEach((k) => allKeys.add(k)));
      const headers = Array.from(allKeys);

      const csvRows = [
        headers.join(','),
        ...flattened.map((row: any) =>
          headers.map((field) => {
            const value = row[field];
            const escaped = typeof value === 'object' ? JSON.stringify(value) : `${value ?? ''}`;
            return `"${escaped.replace(/"/g, '""')}"`;
          }).join(',')
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
      <div class='pl-6 pr-6 pt-6 pb-0 rounded-sm'>
        <div>
          <div class='flex items-center justify-between mb-4'>
            <label class='text-neutral-900 dark:text-white font-semibold'>Results</label>

            {!isLoading && queryResults.length > 0
              ? (
                <a
                  title='Download CSV'
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    handleExportToCSV();
                  }}
                  class='flex items-center text-teal-400 hover:text-teal-300 text-sm'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    class='mr-1'
                  >
                    <path d='M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8zm4 18H6V4h7v5h5zm-8-1l2-4H9v-5h6v5l-2 4z' />
                  </svg>
                  <span>Export CSV</span>
                </a>
              )
              : ('')}
          </div>

          {isLoading
            ? (
              <div class='flex items-center justify-center h-40'>
                <div class='animate-spin rounded-full h-10 w-10 border-t-4 border-teal-400 border-solid'>
                </div>
              </div>
            )
            : (
              <>
                {queryResults.length > 0
                  ? (
                    <div class='overflow-x-auto'>
                      <table class='w-full table-auto border-collapse border border-gray-300 dark:border-gray-600 text-sm'>
                        <thead>
                          <tr class='bg-gray-100 dark:bg-slate-700'>
                            {columnHeaders.map((header) => (
                              <th
                                key={header}
                                class='border px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200'
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {flattenedResults.map((row, rowIndex) => (
                            <tr key={rowIndex} class='border-t'>
                              {columnHeaders.map((header) => (
                                <td key={header} class='border px-4 py-1'>
                                  {row[header] ?? ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div class='flex justify-center items-center mt-4 space-x-4'>
                        <button
                          class='px-3 py-1 bg-gray-300 dark:bg-slate-700 text-sm rounded disabled:opacity-50'
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Prev
                        </button>

                        <span class='text-sm'>
                          Page {currentPage} of {totalPages}
                        </span>

                        <button
                          class='px-3 py-1 bg-gray-300 dark:bg-slate-700 text-sm rounded disabled:opacity-50'
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )
                  : <p class='text-gray-600 dark:text-gray-300 mb-6'>No results to display.</p>}
              </>
            )}
        </div>
      </div>
    );
  };

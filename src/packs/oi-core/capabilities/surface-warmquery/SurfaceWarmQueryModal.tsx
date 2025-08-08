// SurfaceWarmQueryModal.tsx
import { TabbedPanel } from '../../../../../atomic/.exports.ts';
import { marked } from 'npm:marked@15.0.1';
import { useState } from 'npm:preact@10.20.1/hooks';
import { Action } from '../../../../../atomic/.exports.ts';
import type { FunctionalComponent } from 'preact';
import { AziPanel } from '../../../../../atomic/organisms/.exports.ts';
import { SurfaceWarmQueryModalDetails } from './SurfaceWarmQueryModalDetails.tsx';
import { SurfaceWarmQueryModalQuery } from './SurfaceWarmQueryModalQuery.tsx';
import { SurfaceWarmQueryModalResults } from './SurfaceWarmQueryModalResults.tsx';

interface SurfaceWarmQueryModalProps {
  queryName: string;
  queryDescription: string;
  queryText: string;
  queryApiPath: string;
  onClose: () => void;
  onRun: () => void;
  onSave: (name: string, description: string, query: string) => void;
}

export const SurfaceWarmQueryModal: FunctionalComponent<SurfaceWarmQueryModalProps> = ({
  workspace: initialWorkspace,
  queryName: initialName,
  queryDescription: initialDescription,
  queryText: initialQuery,
  queryApiPath: initialApiPath,
  onClose,
  onRun,
  onSave,
}) => {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [queryName, setQueryName] = useState(initialName);
  const [queryDescription, setQueryDescription] = useState(initialDescription);
  const [query, setQuery] = useState(initialQuery);
  const [queryApiPath, setQueryApiPath] = useState(initialApiPath);
  type QueryResultRow = Record<string, unknown>;
  const [queryResults, setQueryResults] = useState<QueryResultRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState('');
  const [activeTabKey, setActiveTabKey] = useState('details');
  setWorkspace(initialWorkspace);
  setErrors('');

  const isSaveDisabled = !queryName || !query || !queryDescription || !queryApiPath || isLoading;
  const isRunDisabled = !query || isLoading;

  const handleRunClick = async () => {
    setIsLoading(true);
    setActiveTabKey('results');
    const result = await onRun(query);
    console.log(result);
    interface QueryTable {
      name: string;
      data: Record<string, unknown>[];
    }
    
    const data =
      result?.tables?.find((t: QueryTable) => t.name === 'PrimaryResult')?.data || [];
    setQueryResults(data);
    setIsLoading(false);
  };

  const tabData = [
    {
      key: 'details',
      label: 'Details',
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          class='h-5 w-5'
        >
          <path d='M4.25 4A2.25 2.25 0 0 0 2 6.25v2.5A2.25 2.25 0 0 0 4.25 11h2.5A2.25 2.25 0 0 0 9 8.75v-2.5A2.25 2.25 0 0 0 6.75 4zm7 1a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zm0 3a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5zm-7 5A2.25 2.25 0 0 0 2 15.25v2.5A2.25 2.25 0 0 0 4.25 20h2.5A2.25 2.25 0 0 0 9 17.75v-2.5A2.25 2.25 0 0 0 6.75 13zm7 1a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zm0 3a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5z' />
        </svg>
      ),
      content: (
        <SurfaceWarmQueryModalDetails
          queryName={queryName}
          queryDescription={queryDescription}
          queryApiPath={queryApiPath}
          onQueryNameChange={setQueryName}
          onQueryDescriptionChange={setQueryDescription}
          onQueryApiPathChange={setQueryApiPath}
        />
      ),
    },
    {
      key: 'query',
      label: 'Query',
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 20 20'
          fill='currentColor'
          class='h-5 w-5'
        >
          <path d='M18.68 12.32a4.49 4.49 0 0 0-6.36.01a4.49 4.49 0 0 0 0 6.36a4.51 4.51 0 0 0 5.57.63L21 22.39L22.39 21l-3.09-3.11c1.13-1.77.87-4.09-.62-5.57m-1.41 4.95c-.98.98-2.56.97-3.54 0c-.97-.98-.97-2.56.01-3.54c.97-.97 2.55-.97 3.53 0c.97.98.97 2.56 0 3.54M10.9 20.1a6.5 6.5 0 0 1-1.48-2.32C6.27 17.25 4 15.76 4 14v3c0 2.21 3.58 4 8 4c-.4-.26-.77-.56-1.1-.9M4 9v3c0 1.68 2.07 3.12 5 3.7v-.2c0-.93.2-1.85.58-2.69C6.34 12.3 4 10.79 4 9m8-6C7.58 3 4 4.79 4 7c0 2 3 3.68 6.85 4h.05c1.2-1.26 2.86-2 4.6-2c.91 0 1.81.19 2.64.56A3.22 3.22 0 0 0 20 7c0-2.21-3.58-4-8-4' />
        </svg>
      ),
      content: (
        <SurfaceWarmQueryModalQuery
          query={query}
          onQueryChange={setQuery}
          errors={errors}
        />
      ),
    },
    {
      key: 'results',
      label: 'Results',
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 20 20'
          fill='currentColor'
          class='h-5 w-5'
        >
          <path d='M11 16H3v3q0 .825.588 1.413T5 21h6zm2 0v5h6q.825 0 1.413-.587T21 19v-3zm-2-2V9H3v5zm2 0h8V9h-8zM3 7h18V5q0-.825-.587-1.412T19 3H5q-.825 0-1.412.588T3 5z' />
        </svg>
      ),
      content: (
        <SurfaceWarmQueryModalResults
          isLoading={isLoading}
          queryName={queryName}
          queryResults={queryResults}
        />
      ),
    },
  ];

  return (
    <div class='fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100]'>
      <div class='bg-black border border-gray-300 dark:border-gray-700 text-white rounded-lg shadow-2xl w-11/12 max-w-[1200px] max-h-[90vh] p-4 overflow-hidden'>
        <h3 class='text-xl font-bold text-white mb-2'>Query: {queryName}</h3>
        <div class='flex flex-row h-[80vh] gap-4'>
          {/* Left Side: Tabs and Buttons */}
          <div class='w-2/3 flex flex-col overflow-hidden pr-2'>
            {/* Tabs Section */}
            <div class='flex-grow overflow-y-visible bg-black rounded-md p-4'>
              <TabbedPanel
                class='mt-2'
                tabs={tabData}
                activeTab={activeTabKey}  
                onTabChange={setActiveTabKey}              
              />
            </div>

            {/* Buttons at the bottom */}
            <div class='mt-0 flex justify-between'>
              <Action
                type='button'
                onClick={onClose}
                class='bg-gray-600 hover:bg-gray-700 text-white'
              >
                Cancel
              </Action>

              <div class='flex space-x-4'>
                <Action
                  type='button'
                  onClick={handleRunClick}
                  disabled={isRunDisabled}
                  class={`font-bold py-2 px-4 rounded ${
                    isRunDisabled
                      ? 'bg-gray-500 cursor-not-allowed opacity-50'
                      : 'bg-teal-600 hover:bg-teal-700'
                  } text-white`}
                >
                  Run Query
                </Action>

                <Action
                  type='button'
                  disabled={isSaveDisabled}
                  onClick={() => onSave(queryName, queryApiPath, queryDescription, query)}
                  class={`font-bold py-2 px-4 rounded ${
                    isSaveDisabled
                      ? 'bg-gray-500 cursor-not-allowed opacity-50'
                      : 'bg-teal-600 hover:bg-teal-700'
                  } text-white`}
                >
                  Save Query
                </Action>
              </div>
            </div>
          </div>

          {/* Right Side: AziPanel */}
          <div class='w-1/3 border-l border-gray-700 pl-4 overflow-y-auto'>
            <AziPanel
              workspaceMgr={workspace}
              renderMessage={(msg) => marked.parse(msg) as string}
              circuitUrl='/api/synaptic/circuits/event-logs'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

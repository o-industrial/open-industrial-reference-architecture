// deno-lint-ignore-file no-explicit-any

// SurfaceWarmQueryModal.tsx
import { TabbedPanel } from '../../../../../atomic/.exports.ts';
import { marked } from 'npm:marked@15.0.1';
import { useEffect, useRef, useState } from 'npm:preact@10.20.1/hooks';
import { Action } from '../../../../../atomic/.exports.ts';
import type { FunctionalComponent } from 'npm:preact@10.20.1';
import { AziPanel } from '../../../../../atomic/organisms/.exports.ts';
import { SurfaceWarmQueryModalDetails } from './SurfaceWarmQueryModalDetails.tsx';
import { SurfaceWarmQueryModalQuery } from './SurfaceWarmQueryModalQuery.tsx';
import { SurfaceWarmQueryModalResults } from './SurfaceWarmQueryModalResults.tsx';
import { AziState, WorkspaceManager } from '../../../../flow/.exports.ts';
import { KustoResponseDataSet } from 'npm:azure-kusto-data@6.0.2';

interface SurfaceWarmQueryModalProps {
  eac: any;
  workspace: WorkspaceManager;
  queryName: string;
  queryDescription: string;
  queryText: string;
  queryApiPath: string;
  onClose: () => void;
  onRun: (query: string) => Promise<KustoResponseDataSet>;
  onSave: (name: string, apiPath: string, description: string, query: string) => void;
  aziExtraInputs?: Record<string, unknown>;
  warmQueryLookup: string;
}

export const SurfaceWarmQueryModal: FunctionalComponent<SurfaceWarmQueryModalProps> = ({
  eac: eac,
  workspace: workspace,
  queryName: initialName,
  queryDescription: initialDescription,
  queryText: initialQuery,
  queryApiPath: initialApiPath,
  onClose,
  onRun,
  onSave,
  aziExtraInputs,
  warmQueryLookup,
}) => {
  const [queryName, setQueryName] = useState(initialName);
  const [queryDescription, setQueryDescription] = useState(initialDescription);
  const [query, setQuery] = useState(initialQuery);
  const [queryApiPath, setQueryApiPath] = useState(initialApiPath);
  type QueryResultRow = Record<string, unknown>;
  const [queryResults, setQueryResults] = useState<QueryResultRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState('details');
  const [errors, setErrors] = useState('');
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveSuccessVisible, setSaveSuccessVisible] = useState(false);

  const isSaveDisabled = !queryName || !query || !queryDescription || !queryApiPath || isLoading;
  const isRunDisabled = !query || isLoading;

  const seenFirstErrorRef = useRef(false);

  const onAziFinishSend = (state: AziState) => {
    setIsLoading(false);
    if (state && state.DataQuery && state.DataQuery != state.CurrentQuery) {
      setQuery(state.DataQuery as string);
      setActiveTabKey('query');
    }

    // Append final banner without overwriting any streamed error history
    setErrors((prev) => (prev ? prev + '\n\n' : '') + '> Azi Responded');
  };

  // Clear console and reset stream tracking when the modal mounts (every open)
  useEffect(() => {
    setErrors('');
    try {
      seenFirstErrorRef.current = false;
      lastAppendedErrorRef.current = undefined;
      lastAppendedErrorCodeRef.current = undefined;
      lastAppendedDataQueryRef.current = undefined;
    } catch (err) {
      console.log(err);
    }
  }, []);

  // Append state.Error changes as they stream
  const lastAppendedErrorRef = useRef<string | undefined>(undefined);
  const lastAppendedErrorCodeRef = useRef<string | undefined>(undefined);
  const lastAppendedDataQueryRef = useRef<string | undefined>(undefined);

  const onAziStateChange = (state: AziState) => {
    // Ignore hydrated errors from initial Peek; only append during an active send
    if (!isLoading) return;

    const err = (state as any)?.Error;
    if (!err) return;

    const errCode = (state as any)?.ErrorCode ?? 'UNKNOWN';
    const dataQuery = (state as any)?.DataQuery ?? (state as any).CurrentQuery;

    const msg = typeof err === 'string' ? err : String(err);

    if (msg === lastAppendedErrorRef.current) {
      return; // append only on change
    }

    lastAppendedErrorRef.current = msg;
    lastAppendedDataQueryRef.current = dataQuery;

    setErrors((prev) => {
      const lead = prev ? prev + '\n\n' : '';
      setQuery(dataQuery);
      if (!seenFirstErrorRef.current) {
        // First error of this run: plain
        seenFirstErrorRef.current = true;
        lastAppendedErrorCodeRef.current = errCode;
        return lead + `> ERROR : ${msg}`;
      } else {
        // Subsequent errors: add resolved banner first
        const final = lead +
          `> Azi Resolved Error: ${lastAppendedErrorCodeRef.current}\n\n> ERROR : ${msg}`;
        lastAppendedErrorCodeRef.current = errCode;
        return final;
      }
    });
  };

  const onAziStartSend = () => {
    setIsLoading(true);
    setActiveTabKey('query');
    setErrors('> Azi Thinking...');
    lastAppendedErrorRef.current = undefined;
    lastAppendedDataQueryRef.current = undefined;
    lastAppendedErrorCodeRef.current = undefined;
    seenFirstErrorRef.current = false;
  };

  const handleRunClick = async () => {
    setActiveTabKey('query');
    setErrors('> Executing Query...');
    setIsLoading(true);
    const result = await onRun(query);
    interface QueryTable {
      name: string;
      data: Record<string, unknown>[];
    }

    if ((result as any).HasError) {
      const errTxt = (result as any).Messages.Error;
      setErrors(`> Executing Query...\n\n> ERROR: ${errTxt}`);
      setActiveTabKey('query');
    } else {
      setErrors('> Query Executed Successfully');
      const table = result?.tables?.find((t) => t.name === 'PrimaryResult');
      const data = (table && 'data' in table) ? (table as QueryTable).data : [];
      setQueryResults(data);
      setActiveTabKey('results');
    }
    setIsLoading(false);
  };

  const norm = (s?: string) => (s ?? '').trim().toLowerCase();

  const handleSaveClick = async () => {
    setSaveErrors([]);
    const errs: string[] = [];
    const currentLookup = warmQueryLookup;
    for (const [lookup, entry] of Object.entries(eac.WarmQueries ?? {})) {
      if (lookup === currentLookup) continue;
      const d = (entry as any).Details ?? {};
      if (norm(d.Name) === norm(queryName)) {
        errs.push(
          `A Warm Query with the name of '${queryName}' already exists in this Workspace`,
        );
      }
    }
    for (const [lookup, entry] of Object.entries(eac.WarmQueries ?? {})) {
      if (lookup === currentLookup) continue;
      const d = (entry as any).Details ?? {};
      if (norm(d.ApiPath) === norm(queryApiPath)) {
        errs.push(
          `A Warm Query with the API path of '${queryApiPath}' already exists in this Workspace`,
        );
      }
    }

    setSaveErrors(errs);
    if (errs.length === 0) {
      // allow onSave to be sync or async
      await onSave(queryName, queryApiPath, queryDescription, query);
      setSaveSuccess('Warm Query saved successfully.');
    }
  };

  const didInitTabs = useRef(false);
  useEffect(() => {
    if (didInitTabs.current) return;
    didInitTabs.current = true;

    // Start on details (you already default to 'details', but set again to be explicit)
    setActiveTabKey('details');

    let raf1 = 0;
    let raf2 = 0;

    // Next frame: go to query
    raf1 = requestAnimationFrame(() => {
      setActiveTabKey('query');
      // Next frame after that: back to details
      raf2 = requestAnimationFrame(() => {
        setActiveTabKey('details');
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    if (!saveSuccess) return;
    // show immediately
    setSaveSuccessVisible(true);
    // start fade ~0.5s before removal
    const fade = setTimeout(() => setSaveSuccessVisible(false), 4_500);
    // remove node after transition completes
    const clear = setTimeout(() => setSaveSuccess(null), 5_000);
    return () => {
      clearTimeout(fade);
      clearTimeout(clear);
    };
  }, [saveSuccess]);

  // Always clear console errors when the modal opens
  useEffect(() => {
    setErrors('');
  }, []);

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
          isLoading={isLoading}
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
      <div
        class='bg-black border border-gray-300 dark:border-gray-700 text-white rounded-lg shadow-2xl w-11/12 max-w-[1200px] p-4 overflow-hidden'
        style='max-height: min(100vh, calc(90vh + 20px));'
      >
        <h3 class='text-xl font-bold text-white mb-2'>Query: {queryName}</h3>
        <div class='flex flex-row gap-4' style='height: calc(80vh + 20px);'>
          {/* Left Side: Tabs and Buttons */}
          <div class='w-2/3 flex flex-col overflow-hidden pr-2 min-h-0'>
            {/* Tabs Section */}
            <div class='flex-grow min-h-0 overflow-hidden bg-black rounded-md p-4'>
              <TabbedPanel
                class='mt-2 h-full min-h-0'
                tabs={tabData}
                activeTab={activeTabKey}
                onTabChange={setActiveTabKey}
              />
            </div>

            {/* Global banners — centered across the whole modal */}
            {(saveErrors.length > 0 || saveSuccess) && (
              <div class='w-full flex justify-center px-2 mb-2'>
                {saveErrors.length > 0
                  ? (
                    <div
                      id='saveErrors'
                      role='alert'
                      style='border-color:#ef4444'
                      class='w-full max-w-[720px] rounded-md border !border-red-500 bg-neutral-900/90 text-red-400 px-4 py-3 text-center'
                    >
                      {saveErrors[0]}
                    </div>
                  )
                  : (
                    saveSuccess && (
                      <div
                        id='saveSuccess'
                        aria-live='polite'
                        class={`w-full max-w-[720px] rounded-md border border-emerald-500 bg-neutral-900/90 text-emerald-300 px-4 py-3 text-center transition-opacity duration-500
                  ${saveSuccessVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                      >
                        {saveSuccess}
                      </div>
                    )
                  )}
              </div>
            )}

            {/* Buttons at the bottom */}
            <div class='mt-0 flex justify-between'>
              <Action
                type='button'
                onClick={onClose}
                class='bg-gray-600 hover:bg-gray-700 text-white'
              >
                Close
              </Action>
              <div class='flex space-x-4'>
                <div id='runWrap' tabIndex={0} aria-disabled='true'>
                  <Action
                    type='button'
                    id='run'
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
                </div>
                <div id='saveWrap' tabIndex={0} aria-disabled='true'>
                  <Action
                    type='button'
                    id='save'
                    disabled={isSaveDisabled}
                    onClick={handleSaveClick}
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
          </div>

          {/* Right Side: AziPanel */}
          <div class='w-1/3 border-l border-gray-700 pl-4 overflow-y-auto'>
            <AziPanel
              workspaceMgr={workspace}
              onStartSend={onAziStartSend}
              onFinishSend={onAziFinishSend}
              onStateChange={onAziStateChange}
              renderMessage={(msg) => marked.parse(msg) as string}
              aziMgr={workspace.WarmQueryAzis[warmQueryLookup]}
              extraInputs={{
                ...aziExtraInputs,
                CurrentQuery: query,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

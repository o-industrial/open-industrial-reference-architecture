// SurfaceWarmQueryInspector.tsx
// deno-lint-ignore-file no-explicit-any
import { useEffect, useMemo, useRef, useState } from 'npm:preact@10.20.1/hooks';
import { Action, InspectorBase } from '../../../../../atomic/.exports.ts';
import { InspectorCommonProps } from '../../../../flow/.exports.ts';
import { SurfaceWarmQueryStats } from './SurfaceWarmQueryStats.tsx';
import { EaCWarmQueryDetails } from '../../../../eac/.deps.ts';
import { SurfaceWarmQueryModal } from '../../../../../atomic/organisms/modals/SurfaceWarmQueryModal.tsx';

type SurfaceWarmQueryInspectorProps = InspectorCommonProps<
  EaCWarmQueryDetails,
  SurfaceWarmQueryStats
>;

export function SurfaceWarmQueryInspector({
  lookup,
  surfaceLookup,
  details,
  enabled,
  useStats,
  oiSvc,
  workspaceMgr,
  onDelete,
  onDetailsChanged,
  onToggleEnabled,
}: SurfaceWarmQueryInspectorProps) {
  const stats = useStats();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const eac = workspaceMgr.EaC.GetEaC();

  workspaceMgr.CreateWarmQueryAziIfNotExist(lookup);

  const aziExtraInputs = useMemo(() => ({
    WarmQueryLookup: lookup,
    SurfaceLookup: surfaceLookup,
  }), [lookup, surfaceLookup]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleRunQuery = (query: string) => {
    console.log('Run query:', details.Query);
    const results = oiSvc.Workspaces.Explorer.RunAdHocQuery({
      ...details,
      Query: query,
    });

    return results;
  };

  const isConnected = () => {
    const surface = eac.Surfaces?.[surfaceLookup!];
    const wqSettings = surface?.WarmQueries?.[lookup];
    if (
      !wqSettings || ((!wqSettings.SchemaLookups || wqSettings.SchemaLookups.length === 0) &&
        (!wqSettings.DataConnectionLookups || wqSettings.DataConnectionLookups.length === 0))
    ) {
      return false;
    }
    return true;
  };

  // --- Debounced inspector fields for Name/Description/ApiPath ---
  const [name, setName] = useState(details.Name ?? '');
  const [desc, setDesc] = useState(details.Description ?? '');
  const [apiPath, setApiPath] = useState(details.ApiPath ?? '');
  const userEditedRef = useRef(false);

  // Keep local state in sync if external details change
  useEffect(() => setName(details.Name ?? ''), [details.Name]);
  useEffect(() => setDesc(details.Description ?? ''), [details.Description]);
  useEffect(() => setApiPath(details.ApiPath ?? ''), [details.ApiPath]);

  // Debounce pushing changes to EaC to avoid spamming history on each keystroke
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (!onDetailsChanged) return;
    if (!userEditedRef.current) return;

    if (debounceRef.current) globalThis.clearTimeout(debounceRef.current);
    debounceRef.current = globalThis.setTimeout(() => {
      const next: Partial<EaCWarmQueryDetails> = {
        ...details,
        Name: name,
        Description: desc,
        ApiPath: apiPath,
      } as Partial<EaCWarmQueryDetails>;
      onDetailsChanged(next);
      debounceRef.current = null;
    }, 300);

    return () => {
      if (debounceRef.current) globalThis.clearTimeout(debounceRef.current);
    };
  }, [name, desc, apiPath]);

  return (
    <>
      <InspectorBase
        iconKey='warmQuery'
        label={name || 'Warm Query Node'}
        enabled={enabled}
        impulseRates={stats?.impulseRates ?? []}
        onToggleEnabled={onToggleEnabled}
        onDelete={onDelete}
      >
        <div class='space-y-3'>
          <div>
            <label class='block text-xs font-semibold text-slate-400 mb-1'>Query Name</label>
            <input
              type='text'
              value={name}
              maxLength={30}
              onInput={(e) => {
                userEditedRef.current = true;
                const val = (e.currentTarget as HTMLInputElement).value;
                setName(val);
                onDetailsChanged?.({
                  ...details,
                  Name: val,
                } as Partial<EaCWarmQueryDetails>);
              }}
              class={`-mx-2 w-full rounded-md border bg-neutral-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                (name ?? '').trim().length === 0
                  ? 'border-neon-red-500 focus:ring-neon-red-500'
                  : 'border-neutral-700 focus:ring-neon-blue-500'
              }`}
              placeholder='Max 30'
            />
          </div>
          <div>
            <label class='block text-xs font-semibold text-slate-400 mb-1'>Description</label>
            <textarea
              value={desc}
              onInput={(e) => {
                userEditedRef.current = true;
                const val = (e.currentTarget as HTMLTextAreaElement).value;
                setDesc(val);
                onDetailsChanged?.({
                  ...details,
                  Description: val,
                } as Partial<EaCWarmQueryDetails>);
              }}
              rows={3}
              maxLength={200}
              class={`-mx-2 w-full rounded-md border bg-neutral-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                (desc ?? '').trim().length === 0
                  ? 'border-neon-red-500 focus:ring-neon-red-500'
                  : 'border-neutral-700 focus:ring-neon-blue-500'
              }`}
              placeholder='Max 200'
            />
          </div>
          <div>
            <label class='block text-xs font-semibold text-slate-400 mb-1'>API Path</label>
            <input
              type='text'
              value={apiPath}
              maxLength={30}
              onInput={(e) => {
                userEditedRef.current = true;
                const raw = (e.currentTarget as HTMLInputElement).value;
                const filtered = raw.toLowerCase().replace(/[^a-z0-9-]/g, '');
                (e.currentTarget as HTMLInputElement).value = filtered;
                setApiPath(filtered);
                onDetailsChanged?.({
                  ...details,
                  ApiPath: filtered,
                } as Partial<EaCWarmQueryDetails>);
              }}
              onKeyDown={(e) => {
                const ke = e as any;
                const valid = /^[a-z0-9-]$/.test(ke.key);
                const ctrl = ke.ctrlKey || ke.metaKey;
                const allowed = [
                  'Backspace',
                  'Delete',
                  'ArrowLeft',
                  'ArrowRight',
                  'ArrowUp',
                  'ArrowDown',
                  'Tab',
                  'Home',
                  'End',
                ];
                if (!valid && !ctrl && !allowed.includes(ke.key)) ke.preventDefault();
              }}
              class={`-mx-2 w-full rounded-md border bg-neutral-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                (apiPath ?? '').trim().length === 0
                  ? 'border-neon-red-500 focus:ring-neon-red-500'
                  : 'border-neutral-700 focus:ring-neon-blue-500'
              }`}
              placeholder='Lower a-z, 0-9, dashes, max 30'
            />
          </div>
        </div>

        <div class='mt-8 pt-6'>
          <Action
            type='button'
            onClick={handleOpenModal}
            disabled={!isConnected()}
            class='bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded mx-auto block'
          >
            Manage Query
          </Action>
          {!isConnected() && (
            <span class='block w-full text-xs text-center italic pt-6'>
              Please connect a data connection or schema and save before managing query.
            </span>
          )}
        </div>
      </InspectorBase>

      {isModalOpen && (
        <SurfaceWarmQueryModal
          workspace={workspaceMgr}
          queryName={details.Name ?? ''}
          queryText={(workspaceMgr.EaC.GetNodeAsCode(lookup)?.Details?.Query as string) ??
            details.Query ?? ''}
          onClose={handleCloseModal}
          onRun={(q) => handleRunQuery(q)}
          aziExtraInputs={aziExtraInputs}
          warmQueryLookup={lookup}
        />
      )}
    </>
  );
}

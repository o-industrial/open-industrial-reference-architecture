import { IntentTypes } from '../../../../../atomic/.deps.ts';
import { useCallback, useEffect, useMemo, useState } from '../../.deps.ts';
import { Action, ActionStyleTypes, InspectorBase } from '../../../../../atomic/.exports.ts';
import { InspectorCommonProps } from '../../../../flow/.exports.ts';
import type {
  EaCInterfaceDetails,
  InterfaceSpec,
  SurfaceInterfaceSettings,
} from '../../../../eac/.exports.ts';
import type { SurfaceInterfaceStats } from './SurfaceInterfaceStats.tsx';
import { SurfaceInterfaceModal } from './SurfaceInterfaceModal.tsx';

type SurfaceInterfaceInspectorProps = InspectorCommonProps<
  EaCInterfaceDetails & SurfaceInterfaceSettings,
  SurfaceInterfaceStats
>;

export function SurfaceInterfaceInspector({
  lookup,
  surfaceLookup,
  details,
  enabled,
  onDelete,
  onDetailsChanged,
  onToggleEnabled,
  useStats,
  workspaceMgr,
}: SurfaceInterfaceInspectorProps) {
  const stats = useStats();
  const [isModalOpen, setModalOpen] = useState(false);

  const resolvedDetails = useMemo(
    () => ensureInterfaceDetails(details, lookup),
    [details, lookup],
  );

  const resolvedSpec = resolvedDetails.Spec;

  const [name, setName] = useState(details.Name ?? '');
  const [description, setDescription] = useState(details.Description ?? '');
  const [apiPath, setApiPath] = useState(details.ApiPath ?? '');

  useEffect(() => setName(details.Name ?? ''), [details.Name]);
  useEffect(() => setDescription(details.Description ?? ''), [details.Description]);
  useEffect(() => setApiPath(details.ApiPath ?? ''), [details.ApiPath]);

  useEffect(() => {
    workspaceMgr.CreateInterfaceAziIfNotExist?.(lookup);
  }, [workspaceMgr, lookup]);

  const handlePersist = useCallback(() => {
    onDetailsChanged({
      Name: name,
      Description: description,
      ApiPath: apiPath,
    });
  }, [name, description, apiPath, onDetailsChanged]);

  const connectedWarmQueries = details.WarmQueryLookups?.length ?? 0;
  const connectedConnections = details.DataConnectionLookups?.length ?? 0;
  const connectedSchemas = details.SchemaLookups?.length ?? 0;

  const lastPublished = stats?.LastPublishedAt
    ? new Date(stats.LastPublishedAt).toLocaleString()
    : 'Never';
  const editorUrlBase = `/workspace/interface/${lookup}`;
  const modeShortcuts: Array<
    { key: 'overview' | 'visual' | 'code' | 'preview'; label: string; intent: IntentTypes }
  > = [
    { key: 'overview', label: 'Overview', intent: IntentTypes.Tertiary },
    { key: 'visual', label: 'Visual', intent: IntentTypes.Primary },
    { key: 'code', label: 'Code', intent: IntentTypes.Secondary },
    { key: 'preview', label: 'Preview', intent: IntentTypes.Info },
  ];

  const bindingsCount = useMemo(
    () => Object.keys(resolvedSpec.Data?.Bindings ?? {}).length,
    [resolvedSpec.Data?.Bindings],
  );

  return (
    <>
      <InspectorBase
        iconKey='interface'
        label={name || 'Interface Node'}
        enabled={enabled}
        impulseRates={[]}
        onToggleEnabled={onToggleEnabled}
        onDelete={onDelete}
      >
        <div class='space-y-4 text-sm text-slate-200'>
          <section class='space-y-2'>
            <label class='block text-xs font-semibold uppercase tracking-wide text-slate-400'>
              Name
            </label>
            <input
              type='text'
              value={name}
              onInput={(event) => setName((event.currentTarget as HTMLInputElement).value)}
              onBlur={handlePersist}
              class='w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-teal-500 focus:outline-none'
            />
          </section>

          <section class='space-y-2'>
            <label class='block text-xs font-semibold uppercase tracking-wide text-slate-400'>
              Description
            </label>
            <textarea
              value={description}
              rows={3}
              onInput={(event) =>
                setDescription((event.currentTarget as HTMLTextAreaElement).value)}
              onBlur={handlePersist}
              class='w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-teal-500 focus:outline-none'
            />
          </section>

          <section class='space-y-2'>
            <label class='block text-xs font-semibold uppercase tracking-wide text-slate-400'>
              API Path
            </label>
            <input
              type='text'
              value={apiPath}
              placeholder='/w/:workspace/ui/:interface'
              onInput={(event) => setApiPath((event.currentTarget as HTMLInputElement).value)}
              onBlur={handlePersist}
              class='w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-teal-500 focus:outline-none'
            />
          </section>

          <section class='grid grid-cols-2 gap-3 text-xs text-slate-300'>
            <div class='rounded border border-slate-700/80 bg-slate-900/70 p-3'>
              <p class='text-[10px] uppercase tracking-wide text-slate-500'>Bindings</p>
              <p class='text-lg font-semibold text-slate-100'>{bindingsCount}</p>
            </div>
            <div class='rounded border border-slate-700/80 bg-slate-900/70 p-3'>
              <p class='text-[10px] uppercase tracking-wide text-slate-500'>Warm Queries</p>
              <p class='text-lg font-semibold text-slate-100'>{connectedWarmQueries}</p>
            </div>
            <div class='rounded border border-slate-700/80 bg-slate-900/70 p-3'>
              <p class='text-[10px] uppercase tracking-wide text-slate-500'>Data Connections</p>
              <p class='text-lg font-semibold text-slate-100'>{connectedConnections}</p>
            </div>
            <div class='rounded border border-slate-700/80 bg-slate-900/70 p-3'>
              <p class='text-[10px] uppercase tracking-wide text-slate-500'>Schemas</p>
              <p class='text-lg font-semibold text-slate-100'>{connectedSchemas}</p>
            </div>
          </section>

          <section class='rounded border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400'>
            <p class='font-semibold text-slate-300'>Publish Summary</p>
            <ul class='mt-2 space-y-1'>
              <li>
                Published Version:{' '}
                <span class='font-semibold text-slate-100'>v{details.Version ?? 1}</span>
              </li>
              <li>
                Last Published: <span class='font-semibold text-slate-100'>{lastPublished}</span>
              </li>
              <li>
                Draft Path:{' '}
                <span class='font-semibold text-slate-100'>
                  {details.DraftState?.SpecPath ?? 'N/A'}
                </span>
              </li>
            </ul>
          </section>

          <div class='flex flex-wrap items-center justify-between gap-2'>
            <div class='flex flex-wrap gap-2'>
              {modeShortcuts.map((shortcut) => (
                <Action
                  key={`interface-shortcut-${lookup}-${shortcut.key}`}
                  href={`${editorUrlBase}?mode=${shortcut.key}`}
                  target='_blank'
                  rel='noreferrer'
                  styleType={ActionStyleTypes.Outline |
                    ActionStyleTypes.UltraThin |
                    ActionStyleTypes.Rounded}
                  intentType={shortcut.intent}
                >
                  {shortcut.label}
                </Action>
              ))}
            </div>
            <Action
              styleType={ActionStyleTypes.Solid | ActionStyleTypes.Rounded}
              intentType={IntentTypes.Primary}
              title='Open Interface Manager'
              onClick={() => setModalOpen(true)}
            >
              Manage Interface
            </Action>
          </div>
        </div>
      </InspectorBase>

      <SurfaceInterfaceModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        interfaceLookup={lookup}
        surfaceLookup={surfaceLookup}
        details={resolvedDetails}
        settings={details as SurfaceInterfaceSettings}
        spec={resolvedSpec}
        draftSpec={undefined}
        workspaceMgr={workspaceMgr}
        onSpecChange={(next) => onDetailsChanged({ Spec: next })}
      />
    </>
  );
}

function ensureInterfaceDetails(
  details: Partial<EaCInterfaceDetails>,
  fallbackLookup: string,
): EaCInterfaceDetails {
  const fallbackName = details.Name?.trim()?.length ? details.Name : `Interface ${fallbackLookup}`;
  const fallbackVersion = details.Version ?? 1;

  return {
    Name: fallbackName,
    Description: details.Description,
    Version: fallbackVersion,
    ApiPath: details.ApiPath,
    Spec: ensureInterfaceSpec(details.Spec, fallbackName, fallbackVersion),
    ComponentTag: details.ComponentTag,
    EmbedOptions: details.EmbedOptions,
    Assets: details.Assets,
    DraftState: details.DraftState,
    Thumbnails: details.Thumbnails,
  };
}

function ensureInterfaceSpec(
  spec: InterfaceSpec | undefined,
  fallbackName: string,
  fallbackVersion: number,
): InterfaceSpec {
  const defaultSpec: InterfaceSpec = {
    Meta: {
      Name: fallbackName,
      Version: fallbackVersion,
      Theme: 'default',
    },
    Data: { Providers: [], Bindings: {} },
    Layout: [
      {
        ID: 'root',
        Type: 'Container',
        IsContainer: true,
        Props: {
          className:
            'flex min-h-[320px] flex-col gap-4 bg-slate-950/80 p-6 rounded-xl border border-slate-800',
        },
        Children: [
          {
            ID: 'headline',
            Type: 'Text',
            Props: {
              value: 'Interface title',
              className: 'text-2xl font-semibold text-slate-100',
            },
          },
          {
            ID: 'subtitle',
            Type: 'Text',
            Props: {
              value: 'Describe the purpose of this HMI page',
              className: 'text-sm text-slate-400',
            },
          },
        ],
      },
    ],
    Actions: [],
  };

  if (!spec) {
    return defaultSpec;
  }

  const meta = spec.Meta ?? {
    Name: fallbackName,
    Version: fallbackVersion,
  };

  const layout = spec.Layout?.length ? spec.Layout : defaultSpec.Layout;

  return {
    ...spec,
    Meta: {
      ...meta,
      Name: meta.Name ?? fallbackName,
      Version: meta.Version ?? fallbackVersion,
      Theme: meta.Theme ?? defaultSpec.Meta.Theme,
    },
    Data: spec.Data ?? defaultSpec.Data,
    Layout: layout,
    Actions: spec.Actions ?? defaultSpec.Actions,
  };
}

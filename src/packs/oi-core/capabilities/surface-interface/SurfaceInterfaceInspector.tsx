import { IntentTypes } from '../../../../../atomic/.deps.ts';
import { JSX, useCallback, useEffect, useMemo, useState } from '../../.deps.ts';
import { Action, ActionStyleTypes, Input, InspectorBase } from '../../../../../atomic/.exports.ts';
import { InspectorCommonProps } from '../../../../flow/.exports.ts';
import type {
  EaCInterfaceDetails,
  InterfaceSpec,
  SurfaceInterfaceSettings,
} from '../../../../eac/.exports.ts';
import type { SurfaceInterfaceStats } from './SurfaceInterfaceStats.tsx';

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

  const resolvedDetails = useMemo(
    () => ensureInterfaceDetails(details, lookup),
    [details, lookup],
  );

  const [name, setName] = useState(details.Name ?? '');
  const [description, setDescription] = useState(details.Description ?? '');
  const [webPath, setWebPath] = useState(details.WebPath ?? '');

  useEffect(() => setName(details.Name ?? ''), [details.Name]);
  useEffect(() => setDescription(details.Description ?? ''), [details.Description]);
  useEffect(() => setWebPath(details.WebPath ?? ''), [details.WebPath]);

  useEffect(() => {
    workspaceMgr.CreateInterfaceAziIfNotExist?.(lookup);
  }, [workspaceMgr, lookup]);

  const handlePersist = useCallback(() => {
    onDetailsChanged({
      Name: name,
      Description: description,
      WebPath: webPath,
    });
  }, [name, description, webPath, onDetailsChanged]);

  const lastPublished = stats?.LastPublishedAt
    ? new Date(stats.LastPublishedAt).toLocaleString()
    : 'Never';

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
            <Input
              label='Name'
              value={name}
              placeholder='interface-your-node'
              onInput={(event: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                setName((event.currentTarget as HTMLInputElement).value)}
              onBlur={handlePersist}
            />
          </section>

          <section class='space-y-2'>
            <Input
              label='Description'
              multiline
              rows={3}
              value={description}
              placeholder='Describe the purpose of this HMI page'
              onInput={(event: JSX.TargetedEvent<HTMLTextAreaElement, Event>) =>
                setDescription((event.currentTarget as HTMLTextAreaElement).value)}
              onBlur={handlePersist}
            />
          </section>

          <section class='space-y-2'>
            <Input
              label='Web Path'
              value={webPath}
              placeholder='/w/:workspace/ui/:interface'
              onInput={(event: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                setWebPath((event.currentTarget as HTMLInputElement).value)}
              onBlur={handlePersist}
            />
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

          {resolvedDetails.WebPath && (
            <Action
              href={resolvedDetails.WebPath}
              target='_blank'
              rel='noreferrer'
              styleType={ActionStyleTypes.Outline | ActionStyleTypes.Rounded}
              intentType={IntentTypes.Secondary}
            >
              Open Interface
            </Action>
          )}
        </div>
      </InspectorBase>
    </>
  );
}

function ensureInterfaceDetails(
  details: Partial<EaCInterfaceDetails>,
  fallbackLookup: string,
): EaCInterfaceDetails {
  const fallbackName = details.Name?.trim()?.length ? details.Name : fallbackLookup;
  const fallbackVersion = details.Version ?? 1;

  return {
    Name: fallbackName,
    Description: details.Description,
    Version: fallbackVersion,
    WebPath: details.WebPath,
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

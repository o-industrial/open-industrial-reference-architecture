import { IntentTypes } from '../../../../../atomic/.deps.ts';
import { Action, ActionStyleTypes, Modal } from '../../../../../atomic/.exports.ts';
import type { InterfaceSpec } from '../../../../eac/InterfaceSpec.ts';
import type { EaCInterfaceDetails, SurfaceInterfaceSettings } from '../../../../eac/.exports.ts';
import { InterfaceEditorHost } from './InterfaceEditorHost.tsx';
import type { WorkspaceManager } from '../../../../flow/.exports.ts';

export type SurfaceInterfaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  interfaceLookup: string;
  surfaceLookup?: string;
  details: EaCInterfaceDetails;
  settings?: SurfaceInterfaceSettings;
  spec: InterfaceSpec;
  draftSpec?: InterfaceSpec;
  workspaceMgr: WorkspaceManager;
  onSpecChange?: (next: InterfaceSpec) => void;
};

export function SurfaceInterfaceModal({
  isOpen,
  onClose,
  interfaceLookup,
  surfaceLookup,
  details,
  settings,
  spec,
  draftSpec,
  workspaceMgr,
  onSpecChange,
}: SurfaceInterfaceModalProps) {
  if (!isOpen) return null;

  const latestVersion = details.Version ?? 1;
  const enterpriseLookup = workspaceMgr.EaC.GetEaC().EnterpriseLookup ?? 'workspace';
  const draftPath = details.DraftState?.SpecPath;
  const editorRoute = '/workspace/interface/' + interfaceLookup;
  const quickModes: Array<{ key: 'overview' | 'visual' | 'code' | 'preview'; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'visual', label: 'Visual' },
    { key: 'code', label: 'Code' },
    { key: 'preview', label: 'Preview' },
  ];


  return (
    <Modal
      title={`Interface: ${details.Name ?? interfaceLookup}`}
      onClose={onClose}
      class='max-w-[1100px] border border-slate-800 bg-slate-950 text-slate-100 shadow-lg'
    >
      <div class='flex flex-col gap-4'>
        <div class='flex flex-wrap gap-4 rounded border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300'>
          <div>
            <span class='block text-slate-500'>Lookup</span>
            <span class='font-semibold text-slate-200'>{interfaceLookup}</span>
          </div>
          {surfaceLookup && (
            <div>
              <span class='block text-slate-500'>Surface</span>
              <span class='font-semibold text-slate-200'>{surfaceLookup}</span>
            </div>
          )}
          <div>
            <span class='block text-slate-500'>Version</span>
            <span class='font-semibold text-slate-200'>v{latestVersion}</span>
          </div>
          <div>
            <span class='block text-slate-500'>API Path</span>
            <span class='font-semibold text-slate-200'>{details.ApiPath ?? 'N/A'}</span>
          </div>
          <div>
            <span class='block text-slate-500'>Draft Path</span>
            <span class='font-semibold text-slate-200'>{draftPath ?? 'N/A'}</span>
          </div>
          <div>
            <span class='block text-slate-500'>Theme</span>
            <span class='font-semibold text-slate-200'>
              {settings?.Theme ?? details.Spec.Meta.Theme ?? 'default'}
            </span>
          </div>
          <div>
            <span class='block text-slate-500'>Refresh</span>
            <span class='font-semibold text-slate-200'>
              {settings?.RefreshMs ? `${settings.RefreshMs} ms` : 'disabled'}
            </span>
          </div>
        </div>

        <div class='flex flex-wrap items-center justify-between gap-2 border border-slate-800 bg-slate-900/40 px-4 py-3'>
          <div class='flex flex-wrap gap-2'>
            {quickModes.map((mode) => (
              <Action
                key={'interface-mode-' + mode.key}
                href={editorRoute + '?mode=' + mode.key}
                target='_blank'
                rel='noreferrer'
                styleType={
                  ActionStyleTypes.Outline |
                  ActionStyleTypes.UltraThin |
                  ActionStyleTypes.Rounded
                }
                intentType={
                  mode.key === 'visual'
                    ? IntentTypes.Primary
                    : mode.key === 'code'
                    ? IntentTypes.Secondary
                    : IntentTypes.Tertiary
                }
              >
                {mode.label} Mode
              </Action>
            ))}
          </div>
          <Action
            href={editorRoute}
            target='_blank'
            rel='noreferrer'
            styleType={ActionStyleTypes.Solid | ActionStyleTypes.Rounded}
            intentType={IntentTypes.Primary}
          >
            Open Full Editor
          </Action>
        </div>
        <InterfaceEditorHost
          spec={spec}
          draftSpec={draftSpec}
          onSpecChange={onSpecChange}
          defaultMode='overview'
        />

        <footer class='rounded border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400'>
          <p>
            Azi tooling for interfaces will persist threads under the lookup
            <code class='ml-1 rounded bg-slate-800 px-2 py-1 font-mono text-[10px] text-slate-200'>
              {`workspace-${enterpriseLookup}-interface-${interfaceLookup}`}
            </code>.
          </p>
        </footer>
      </div>
    </Modal>
  );
}

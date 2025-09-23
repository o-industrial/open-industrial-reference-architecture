import { IntentTypes, Position } from '../../../../../atomic/.deps.ts';
import { Action, ActionStyleTypes } from '../../../../../atomic/.exports.ts';
import { NodeHandle } from '../../../../../atomic/atoms/NodeHandle.tsx';
import { WorkspaceNodeRendererBase } from '../../../../../atomic/organisms/renderers/WorkspaceNodeRendererBase.tsx';
import { NodeProps } from '../../.deps.ts';
import { SurfaceInterfaceNodeData } from './SurfaceInterfaceNodeData.tsx';

export default function SurfaceInterfaceNodeRenderer({
  data,
}: NodeProps<SurfaceInterfaceNodeData>) {
  const providers = data.details?.Spec?.Data?.Providers?.length ?? 0;
  const bindings = Object.keys(data.details?.Spec?.Data?.Bindings ?? {}).length;
  const actions = data.details?.Spec?.Actions?.length ?? 0;
  const layoutNodes = data.details?.Spec?.Layout?.length ?? 0;
  const apiPath = data.details.ApiPath ?? '/w/:workspace/ui/:interface';

  return (
    <WorkspaceNodeRendererBase
      iconKey='interface'
      label={data.label ?? data.details.Name ?? data.type}
      enabled={data.enabled}
      onDoubleClick={data.onDoubleClick}
      isSelected={data.isSelected}
      preMain={
        <NodeHandle
          type='target'
          position={Position.Left}
          intentType={IntentTypes.Secondary}
        />
      }
      postMain={
        <NodeHandle
          type='source'
          position={Position.Right}
          intentType={IntentTypes.Primary}
        />
      }
      class='transition-[width,height] data-[state=expanded]:w-[320px] data-[state=expanded]:h-auto'
    >
      <div class='flex w-full flex-col gap-2 px-3 pb-3 pt-2 text-xs text-slate-200'>
        <div class='rounded border border-slate-800 bg-slate-900/70 px-3 py-2 text-[11px] text-slate-300'>
          <span class='font-semibold text-slate-100'>Route:</span>
          <span class='ml-2 font-mono text-teal-200'>{apiPath}</span>
        </div>

        <div class='grid grid-cols-2 gap-2'>
          <div class='rounded border border-slate-800/70 bg-slate-900/60 p-2 text-center'>
            <p class='text-[10px] uppercase tracking-wide text-slate-500'>Providers</p>
            <p class='text-lg font-semibold text-slate-100'>{providers}</p>
          </div>
          <div class='rounded border border-slate-800/70 bg-slate-900/60 p-2 text-center'>
            <p class='text-[10px] uppercase tracking-wide text-slate-500'>Bindings</p>
            <p class='text-lg font-semibold text-slate-100'>{bindings}</p>
          </div>
          <div class='rounded border border-slate-800/70 bg-slate-900/60 p-2 text-center'>
            <p class='text-[10px] uppercase tracking-wide text-slate-500'>Actions</p>
            <p class='text-lg font-semibold text-slate-100'>{actions}</p>
          </div>
          <div class='rounded border border-slate-800/70 bg-slate-900/60 p-2 text-center'>
            <p class='text-[10px] uppercase tracking-wide text-slate-500'>Layout Nodes</p>
            <p class='text-lg font-semibold text-slate-100'>{layoutNodes}</p>
          </div>
        </div>

        <div class='flex justify-end'>
          <Action
            title='Open Interface Inspector'
            styleType={ActionStyleTypes.Secondary}
            intentType={IntentTypes.Primary}
            onClick={() => data.onDoubleClick?.()}
          >
            Inspect
          </Action>
        </div>
      </div>
    </WorkspaceNodeRendererBase>
  );
}

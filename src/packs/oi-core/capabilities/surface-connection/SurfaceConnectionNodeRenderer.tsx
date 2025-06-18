import { NodeProps } from '../../.deps.ts';
import { Position } from '../../../../../atomic/.deps.ts';
import { LinePreviewWithValue } from '../../../../../atomic/.exports.ts';
import { NodeHandle } from '../../../../../atomic/atoms/NodeHandle.tsx';
import { IntentTypes } from '../../../../types/IntentTypes.ts';
import { SurfaceConnectionNodeData } from './SurfaceConnectionNodeData.tsx';
import { WorkspaceNodeRendererBase } from '../../../../../atomic/organisms/renderers/WorkspaceNodeRendererBase.tsx';

export default function SurfaceConnectionNodeRenderer({
  data,
}: NodeProps<SurfaceConnectionNodeData>) {
  const stats = data.useStats();
  const impulses = stats?.impulseRates ?? [];
  const latest = impulses.at(-1);

  return (
    <WorkspaceNodeRendererBase
      iconKey='connection'
      label={data.label}
      enabled={data.enabled}
      onDoubleClick={data.onDoubleClick}
      isSelected={data.isSelected}
      pulseIntent={IntentTypes.Info}
      class='data-[state=expanded]:w-[300px] data-[state=expanded]:h-auto data-[state=expanded]:rounded-md'
      postMain={
        <NodeHandle
          type='source'
          position={Position.Right}
          intentType={IntentTypes.Info}
        />
      }
    >
      {impulses.length > 1
        ? (
          <LinePreviewWithValue
            label='Impulse'
            values={impulses}
            currentValue={latest}
            intent={IntentTypes.Info}
            yMin={5}
            yMax={20}
          />
        )
        : <div class='text-sm text-gray-400 italic p-2'>Awaiting data…</div>}
    </WorkspaceNodeRendererBase>
  );
}

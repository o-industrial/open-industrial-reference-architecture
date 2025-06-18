import {
  NodeProps,
  WorkspaceNodeRendererBase,
  IntentTypes,
  NodeHandle,
  PositionTypes,
  LinePreviewWithValue,
} from '../../.deps.ts';
import { SurfaceConnectionNodeData } from './SurfaceConnectionNodeData.tsx';

export default function SurfaceConnectionNodeRenderer({
  data,
}: NodeProps<SurfaceConnectionNodeData>) {
  const stats = data.useStats();
  const impulses = stats?.impulseRates ?? [];
  const latest = impulses.at(-1);

  return (
    <WorkspaceNodeRendererBase
      iconKey="connection"
      label={data.label}
      enabled={data.enabled}
      onDoubleClick={data.onDoubleClick}
      isSelected={data.isSelected}
      pulseIntent={IntentTypes.Info}
      class="data-[state=expanded]:w-[300px] data-[state=expanded]:h-auto data-[state=expanded]:rounded-md"
      postMain={
        <NodeHandle
          type="source"
          position={PositionTypes.Right}
          intentType={IntentTypes.Info}
        />
      }
    >
      {impulses.length > 1 ? (
        <LinePreviewWithValue
          label="Impulse"
          values={impulses}
          currentValue={latest}
          intent={IntentTypes.Info}
          yMin={5}
          yMax={20}
        />
      ) : (
        <div class="text-sm text-gray-400 italic p-2">Awaiting data…</div>
      )}
    </WorkspaceNodeRendererBase>
  );
}

import { InspectorBase, NodeStatTile } from '../../../../../atomic/.exports.ts';
import { InspectorCommonProps } from '../../../../flow/.exports.ts';
import { SurfaceWarmQueryStats } from './SurfaceWarmQueryStats.tsx';
import { EaCWarmQueryDetails } from '../../../../eac/.deps.ts';

type SurfaceWarmQueryInspectorProps = InspectorCommonProps<
  EaCWarmQueryDetails,
  SurfaceWarmQueryStats
>;

export function SurfaceWarmQueryInspector({
  details,
  enabled,
  useStats,
  onDelete,
  onDetailsChanged: _onDetailsChanged,
  onToggleEnabled,
}: SurfaceWarmQueryInspectorProps) {
  const stats = useStats();

  return (
    <InspectorBase
      iconKey='warmQuery'
      label={details.Name ?? 'Warm Query Node'}
      enabled={enabled}
      impulseRates={stats?.impulseRates ?? []}
      onToggleEnabled={onToggleEnabled}
      onDelete={onDelete}
    >
      <NodeStatTile label='Matches' value={stats?.matchesHandled || 0} />
      <NodeStatTile label='Avg Latency' value={`${stats?.avgLatencyMs}ms`} />
    </InspectorBase>
  );
}

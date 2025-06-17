import { InspectorBase, NodeStatTile, TabbedPanel } from '../../../../../atomic/.exports.ts';
import { EaCSimulatorDetails } from '../../../../eac/EaCSimulatorDetails.ts';
import { InspectorCommonProps } from '../../../../flow/.exports.ts';

type SimulatorStats = {
  impulseRates?: number[];
  instanceCount?: number;
  avgStartupMs?: number;
  lastDeploymentAt?: string;
};

type SimulatorInspectorProps = InspectorCommonProps<
  EaCSimulatorDetails,
  SimulatorStats
>;

function SimulatorAnalyticsTab({ stats }: { stats?: SimulatorStats }) {
  const {
    instanceCount = 0,
    avgStartupMs = 0,
    lastDeploymentAt = '—',
  } = stats ?? {};

  return (
    <div class='grid grid-cols-3 gap-2 mt-2'>
      <NodeStatTile label='Instances' value={instanceCount} />
      <NodeStatTile label='Startup Time' value={`${avgStartupMs}ms`} />
      <NodeStatTile label='Last Deploy' value={lastDeploymentAt} />
    </div>
  );
}

function SimulatorStreamTab() {
  return (
    <p class='text-sm text-neutral-300'>
      📡 Incoming data and deployment logs will appear here.
    </p>
  );
}

export function SimulatorInspector({
  details,
  enabled,
  useStats,
  onDelete,
  onDetailsChanged: _onDetailsChanged,
  onToggleEnabled,
}: SimulatorInspectorProps) {
  const stats = useStats();

  return (
    <InspectorBase
      iconKey='simulator'
      label={details.Name}
      enabled={enabled}
      impulseRates={stats?.impulseRates ?? []}
      onToggleEnabled={onToggleEnabled}
      onDelete={onDelete}
    >
      <TabbedPanel
        initialTab='settings'
        class='mt-2'
        tabs={[
          {
            key: 'settings',
            label: 'Settings',
            content: (
              <div class='text-sm text-neutral-300'>
                ⚙️ Simulator configuration form coming soon.
              </div>
            ),
          },
          {
            key: 'analytics',
            label: 'Analytics',
            content: <SimulatorAnalyticsTab stats={stats} />,
          },
          {
            key: 'stream',
            label: 'Logs / Stream',
            content: <SimulatorStreamTab />,
          },
        ]}
      />
    </InspectorBase>
  );
}

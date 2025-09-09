import {
  ConnectionInfoPanel,
  ConnectionManagementForm,
  InspectorBase,
  TabbedPanel,
} from '../../../../../atomic/.exports.ts';
import { EaCAzureIoTHubDataConnectionDetails } from '../../../../eac/EaCAzureIoTHubDataConnectionDetails.ts';
import { InspectorCommonProps } from '../../../../flow/.exports.ts';
import { DataConnectionConfig } from './DataConnectionConfig.ts';
import { DataConnectionStats } from './DataConnectionStats.ts';

type ConnectionInspectorProps = InspectorCommonProps<
  EaCAzureIoTHubDataConnectionDetails,
  DataConnectionStats,
  DataConnectionConfig
>;

export function ConnectionInspector({
  config,
  details,
  enabled,
  useStats,
  onDelete,
  onDetailsChanged,
  onToggleEnabled,
}: ConnectionInspectorProps) {
  const stats = useStats();
  const ingestOptions = config?.ingestOptions ?? [];

  return (
    <InspectorBase
      iconKey='connection'
      label={details.Name}
      enabled={enabled}
      impulseRates={stats?.ImpulseRates ?? []}
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
              <ConnectionManagementForm
                details={details as EaCAzureIoTHubDataConnectionDetails}
                onChange={onDetailsChanged}
                ingestOptions={ingestOptions}
              />
            ),
          },
          {
            key: 'connection',
            label: 'Connection Info',
            content: (
              <ConnectionInfoPanel
                connectionInfo={stats?.Metadata}
                healthStatus={stats?.HealthStatus}
                lastReceivedTimestamp={stats?.LastReceivedTimestamp}
              />
            ),
          },
          {
            key: 'analytics',
            label: 'Analytics',
            content: (
              <p class='text-sm text-neutral-300'>
                📈 Connection analytics will appear here.
              </p>
            ),
          },
          {
            key: 'stream',
            label: 'Impulse Stream',
            content: (
              <p class='text-sm text-neutral-300'>
                📡 Live impulse logs and stream filtering.
              </p>
            ),
          },
        ]}
      />
    </InspectorBase>
  );
}

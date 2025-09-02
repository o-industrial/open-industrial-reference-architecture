import { InspectorBase, TabbedPanel } from '../../../../../atomic/.exports.ts';
import { EaCAzureDockerSimulatorDetails } from '../../../../eac/EaCAzureDockerSimulatorDetails.ts';
import { InspectorCommonProps } from '../../../../flow/.exports.ts';
import { SimulatorManagementForm } from '../../../../../atomic/molecules/SimulatorManagementForm.tsx';

type SimulatorStats = {
  impulseRates?: number[];
  instanceCount?: number;
  avgStartupMs?: number;
  lastDeploymentAt?: string;
};

type SimulatorInspectorProps = InspectorCommonProps<
  EaCAzureDockerSimulatorDetails,
  SimulatorStats
>;

export function SimulatorInspector({
  details,
  enabled,
  useStats,
  onDelete,
  onDetailsChanged,
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
              <SimulatorManagementForm
                details={details as EaCAzureDockerSimulatorDetails}
                onChange={onDetailsChanged}
              />
            ),
          },
        ]}
      />
    </InspectorBase>
  );
}

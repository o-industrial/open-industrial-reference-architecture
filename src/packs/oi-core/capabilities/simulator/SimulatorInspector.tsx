import { InspectorBase, TabbedPanel } from '../../../../../atomic/.exports.ts';
import { EaCAzureDockerSimulatorDetails } from '../../../../eac/EaCAzureDockerSimulatorDetails.ts';
import { InspectorCommonProps } from '../../../../flow/.exports.ts';
import { SimulatorManagementForm } from '../../../../../atomic/molecules/SimulatorManagementForm.tsx';
import { VariablesEditor } from '../../../../../atomic/molecules/simulators/VariablesEditor.tsx';
import { TemplateEditor } from '../../../../../atomic/molecules/simulators/TemplateEditor.tsx';

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
          {
            key: 'variables',
            label: 'Variables',
            content: (
              <VariablesEditor
                value={(details as EaCAzureDockerSimulatorDetails).Variables}
                onChange={(vars) =>
                  onDetailsChanged({
                    Variables: vars as unknown as Record<string, unknown>,
                  })}
              />
            ),
          },
          {
            key: 'template',
            label: 'Template',
            content: (
              <TemplateEditor
                value={(details as EaCAzureDockerSimulatorDetails).MessageTemplate}
                variables={(details as EaCAzureDockerSimulatorDetails).Variables}
                onChange={(tmpl) => onDetailsChanged({ MessageTemplate: tmpl })}
              />
            ),
          },
        ]}
      />
    </InspectorBase>
  );
}

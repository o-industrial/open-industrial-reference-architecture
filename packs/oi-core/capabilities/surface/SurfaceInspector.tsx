import {
  InspectorCommonProps,
  EaCSurfaceDetails,
  InspectorBase,
  TabbedPanel,
} from '../../.deps.ts';
import { SurfaceManagementForm } from './SurfaceManagementForm.tsx';
import { SurfaceStats } from './SurfaceStats.ts';

type SurfaceInspectorProps = InspectorCommonProps<
  EaCSurfaceDetails,
  SurfaceStats
>;

function SurfaceAnalyticsTab() {
  return (
    <p class="text-sm text-neutral-300">
      📈 Surface-level analytics will appear here.
    </p>
  );
}

function SurfaceStreamTab() {
  return (
    <p class="text-sm text-neutral-300">
      📡 Impulses received and routed on this surface.
    </p>
  );
}

export function SurfaceInspector({
  details,
  enabled,
  useStats,
  onDelete,
  onDetailsChanged,
  onToggleEnabled,
}: SurfaceInspectorProps) {
  const stats = useStats();

  return (
    <InspectorBase
      iconKey="surface"
      label={details.Name}
      enabled={enabled}
      impulseRates={stats?.impulseRates ?? []}
      onToggleEnabled={onToggleEnabled}
      onDelete={onDelete}
    >
      <TabbedPanel
        initialTab="settings"
        class="mt-2"
        tabs={[
          {
            key: 'settings',
            label: 'Settings',
            content: (
              <SurfaceManagementForm
                details={details}
                onChange={onDetailsChanged}
              />
            ),
          },
          {
            key: 'analytics',
            label: 'Analytics',
            content: <SurfaceAnalyticsTab />,
          },
          {
            key: 'stream',
            label: 'Impulse Stream',
            content: <SurfaceStreamTab />,
          },
        ]}
      />
    </InspectorBase>
  );
}

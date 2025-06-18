import { IntentTypes, JSX } from '../../.deps.ts';
import { Action, ActionStyleTypes, SimulatorIcon } from '../../.exports.ts';

export type SystemControlsProps = {
  onOpenSimulatorLibrary?: () => void;
  simIntent?: IntentTypes;
};

export function SystemControls({
  onOpenSimulatorLibrary,
  simIntent = IntentTypes.Info,
}: SystemControlsProps): JSX.Element {
  return (
    <div class="flex flex-row items-center justify-center gap-2 px-2 py-1 bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 rounded-md shadow-sm">
      <Action
        styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
        intentType={simIntent}
        onClick={onOpenSimulatorLibrary}
        title="Open Simulator Library"
      >
        <SimulatorIcon class="w-6 h-6" />
      </Action>
    </div>
  );
}

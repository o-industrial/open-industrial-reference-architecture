import { IntentTypes, JSX } from '../../.deps.ts';
import { Action, ActionStyleTypes, Badge } from '../../.exports.ts';

export type SimulatorPackCardProps = {
  id: string;
  name: string;
  description: string;
  simulatorCount: number;
  usedSimulators?: number;
  onInstallPack: (id: string) => void;
};

export function SimulatorPackCard({
  id,
  name,
  description,
  simulatorCount,
  usedSimulators = 0,
  onInstallPack,
}: SimulatorPackCardProps): JSX.Element {
  const usageLabel = `${usedSimulators} of ${simulatorCount} in use`;

  return (
    <div class="relative bg-neutral-900 border border-neutral-700 rounded-lg p-4 flex flex-col space-y-2 hover:shadow-md transition-shadow">
      <h3 class="text-neon-cyan-400 font-bold text-sm">{name}</h3>
      <p class="text-neutral-400 text-xs">{description}</p>

      <div class="flex justify-between items-center text-xs text-neutral-500">
        <div class="flex flex-col">
          <span>{simulatorCount} Simulators</span>

          <Badge intentType={IntentTypes.Tertiary}>{usageLabel}</Badge>
        </div>

        <Action
          onClick={() => onInstallPack(id)}
          styleType={ActionStyleTypes.Outline | ActionStyleTypes.Thin}
        >
          Use Pack
        </Action>
      </div>
    </div>
  );
}

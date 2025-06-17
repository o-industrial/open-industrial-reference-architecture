import { JSX } from '../../.deps.ts';
import { Action, ActionStyleTypes } from '../../atoms/Action.tsx';

export type SimulatorCardProps = {
  id: string;
  name: string;
  description: string;
  category: string;
  onInstall: (id: string) => void;
};

export function SimulatorCard({
  id,
  name,
  description,
  category,
  onInstall,
}: SimulatorCardProps): JSX.Element {
  return (
    <div class="bg-neutral-800 border border-neutral-700 rounded-lg p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
      <div>
        <h3 class="text-white font-semibold text-sm mb-1">{name}</h3>
        <p class="text-neutral-400 text-xs mb-2">{description}</p>
        <div class="text-xs text-neon-blue-400">#{category}</div>
      </div>
      <Action
        onClick={() => onInstall(id)}
        class="mt-3 text-xs"
        styleType={ActionStyleTypes.Solid | ActionStyleTypes.Thin}
      >
        Use Simulator
      </Action>
    </div>
  );
}

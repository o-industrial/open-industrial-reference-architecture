import { JSX, IntentTypes } from '../.deps.ts';

type NodeStatTileProps = {
  label: string;
  value: string | number;
  intent?: IntentTypes;
  animate?: boolean;
};

export function NodeStatTile({
  label,
  value,
  intent = IntentTypes.Primary,
  animate = false,
}: NodeStatTileProps): JSX.Element {
  const intentClass = {
    [IntentTypes.None]: '',
    [IntentTypes.Primary]: 'text-neon-violet-400',
    [IntentTypes.Secondary]: 'text-neon-indigo-400',
    [IntentTypes.Tertiary]: 'text-neon-blue-400',
    [IntentTypes.Warning]: 'text-neon-yellow-400',
    [IntentTypes.Error]: 'text-neon-red-500',
    [IntentTypes.Info]: 'text-neon-cyan-400',
  }[intent];

  return (
    <div class="flex flex-col items-center text-center flex-1 space-y-1">
      <span class="text-sm font-medium text-gray-300">{label}</span>
      <span
        class={`text-2xl font-bold tracking-tight ${intentClass} ${
          animate ? 'animate-pulse' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}

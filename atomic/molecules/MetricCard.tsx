import { JSX, IntentTypes } from '../.deps.ts';
import { LineSparkSVG } from '../.exports.ts';

type MetricCardProps = {
  label: string;
  value: number | string;
  delta?: number;
  values?: number[];
  intent?: IntentTypes;
  animate?: boolean;
  class?: string;
};

export function MetricCard({
  label,
  value,
  delta,
  values,
  intent = IntentTypes.Primary,
  animate = true,
  class: className = '',
}: MetricCardProps): JSX.Element {
  const valueClass = {
    [IntentTypes.None]: 'text-white',
    [IntentTypes.Primary]: 'text-neon-violet-400',
    [IntentTypes.Secondary]: 'text-neon-indigo-400',
    [IntentTypes.Tertiary]: 'text-neon-blue-400',
    [IntentTypes.Warning]: 'text-neon-yellow-400',
    [IntentTypes.Error]: 'text-neon-red-500',
    [IntentTypes.Info]: 'text-neon-cyan-400',
  }[intent];

  const deltaClass = delta != null && delta < 0
    ? 'text-neon-red-500'
    : 'text-neon-green-400';

  return (
    <div class={`flex flex-col gap-2 p-4 rounded-md border border-neutral-700 bg-neutral-900 ${className}`}>
      <span class="text-sm text-gray-400">{label}</span>
      <div class="flex items-baseline gap-2">
        <span class={`text-3xl font-bold ${valueClass}`}>{value}</span>
        {delta != null && (
          <span class={`text-sm ${deltaClass}`}>
            {delta >= 0 ? '+' : ''}{delta}
          </span>
        )}
      </div>
      {values && values.length > 0 && (
        <LineSparkSVG
          lines={[{ values, intent }]}
          height={40}
          animate={animate}
        />
      )}
    </div>
  );
}


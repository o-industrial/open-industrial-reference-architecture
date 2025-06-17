import { IntentTypes, JSX, classSet } from '../.deps.ts';
import { Icon } from '../.exports.ts';

export default function NodePresetItem({
  label,
  iconKey,
  type,
  intent = IntentTypes.Info,
}: {
  label: string;
  iconKey: string;
  type: string;
  intent?: IntentTypes;
}): JSX.Element {
  const intentClass = {
    [IntentTypes.None]: 'bg-neutral-600 text-white',
    [IntentTypes.Primary]: 'bg-neon-blue-600 text-white',
    [IntentTypes.Secondary]: 'bg-neutral-700 text-white',
    [IntentTypes.Info]: 'bg-neon-cyan-700 text-white',
    [IntentTypes.Warning]: 'bg-neon-yellow-700 text-black',
    [IntentTypes.Error]: 'bg-neon-red-600 text-white',
    [IntentTypes.Tertiary]: 'bg-neutral-800 text-white',
  }[intent];

  const iconColorClass = {
    [IntentTypes.None]: 'text-neutral-400',
    [IntentTypes.Primary]: 'text-neon-blue-400',
    [IntentTypes.Secondary]: 'text-neutral-400',
    [IntentTypes.Info]: 'text-neon-cyan-400',
    [IntentTypes.Warning]: 'text-neon-yellow-400',
    [IntentTypes.Error]: 'text-neon-red-400',
    [IntentTypes.Tertiary]: 'text-violet-400',
  }[intent];

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer?.setData('application/node-type', type);
      }}
      class="relative group flex items-center justify-center w-10 h-10 rounded hover:bg-neutral-800 cursor-move border border-transparent hover:border-neutral-700 transition"
    >
      <Icon
        icon={iconKey}
        src="/icons/iconset"
        class={classSet([
          'w-6 h-6 opacity-90 transition-colors',
          iconColorClass,
        ])}
      />

      {/* Tooltip */}
      <div
        class={classSet([
          'absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10',
          intentClass,
        ])}
      >
        {label}
      </div>
    </div>
  );
}

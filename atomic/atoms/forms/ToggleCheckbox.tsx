import { IntentTypes, ComponentChildren, JSX } from '../../.deps.ts';

export type ToggleCheckboxProps = {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  title?: string;
  class?: string;
  disabled?: boolean;

  checkedIntentType?: IntentTypes | string;
  uncheckedIntentType?: IntentTypes | string;

  checkedIcon?: ComponentChildren;
  uncheckedIcon?: ComponentChildren;
};

// Tailwind-safe text class map
const TEXT_CLASS_MAP: Record<IntentTypes, string> = {
  [IntentTypes.Primary]: 'text-neon-violet-400',
  [IntentTypes.Secondary]: 'text-neon-indigo-400',
  [IntentTypes.Tertiary]: 'text-neon-blue-400',
  [IntentTypes.Info]: 'text-neon-cyan-400',
  [IntentTypes.Warning]: 'text-neon-yellow-400',
  [IntentTypes.Error]: 'text-neon-red-400',
  [IntentTypes.None]: 'text-neon-green-400',
};

function resolveTextClass(intent?: IntentTypes | string): string {
  if (!intent) return TEXT_CLASS_MAP[IntentTypes.None];

  return typeof intent === 'string'
    ? intent
    : TEXT_CLASS_MAP[intent] ?? TEXT_CLASS_MAP[IntentTypes.None];
}

export function ToggleCheckbox({
  checked,
  onToggle,
  title = 'Toggle',
  class: className = '',
  disabled = false,
  checkedIntentType = IntentTypes.Primary,
  uncheckedIntentType = IntentTypes.Error,
  checkedIcon = '✔',
  uncheckedIcon = '✕',
}: ToggleCheckboxProps): JSX.Element {
  const intent = checked ? checkedIntentType : uncheckedIntentType;
  const textClass = resolveTextClass(intent);
  const opacityClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <label
      title={title}
      class={`relative inline-flex items-center justify-center w-5 h-5 border rounded-sm bg-slate-800 border-slate-500 ${opacityClass} ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onToggle(e.currentTarget.checked)}
        disabled={disabled}
        class="sr-only peer"
      />
      <span
        class={`text-xs font-bold transition-all duration-200 ${textClass}`}
      >
        {checked ? checkedIcon : uncheckedIcon}
      </span>
    </label>
  );
}

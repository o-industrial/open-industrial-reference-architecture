import { IntentTypes, JSX, classSet } from '../../.deps.ts';

export type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onToggle: (next: boolean) => void;
  disabled?: boolean;
  intentType?: IntentTypes;
} & JSX.HTMLAttributes<HTMLLabelElement>;

export function CheckboxRow({
  label,
  checked,
  onToggle,
  disabled = false,
  intentType,
  ...props
}: CheckboxRowProps): JSX.Element {
  const classesByIntent = {
    [IntentTypes.Warning]: {
      text: 'text-neon-yellow-400',
      accent: 'accent-neon-yellow-400',
    },
    [IntentTypes.Error]: {
      text: 'text-neon-red-400',
      accent: 'accent-neon-red-400',
    },
    [IntentTypes.Info]: {
      text: 'text-neon-cyan-400',
      accent: 'accent-neon-cyan-400',
    },
    [IntentTypes.Secondary]: {
      text: 'text-neon-indigo-400',
      accent: 'accent-neon-indigo-400',
    },
    [IntentTypes.Tertiary]: {
      text: 'text-neon-blue-400',
      accent: 'accent-neon-blue-400',
    },
    [IntentTypes.Primary]: {
      text: 'text-neon-violet-400',
      accent: 'accent-neon-violet-400',
    },
    [IntentTypes.None]: {
      text: '',
      accent: '',
    },
    default: {
      text: '',
      accent: '',
    },
  };

  const { text, accent } =
    intentType !== undefined
      ? classesByIntent[intentType] ?? classesByIntent.default
      : classesByIntent.default;

  return (
    <label
      class={classSet(
        [
          `flex items-center justify-between px-2 py-1 text-sm`,
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:bg-neutral-700',
        ],
        props
      )}
    >
      <span class={text}>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onToggle(e.currentTarget.checked)}
        class={`form-checkbox ${accent}`}
      />
    </label>
  );
}

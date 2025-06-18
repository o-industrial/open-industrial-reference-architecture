import { JSX } from '../.deps.ts';
import { CheckboxRow } from '../atoms/forms/CheckboxRow.tsx';

export type MultiSelectCheckboxGroupProps = {
  label?: string;
  options: {
    label: string;
    value: string;
    enabled?: boolean;
  }[];
  selected: string[];
  onChange: (nextSelected: string[]) => void;
  class?: string;
};

export function MultiSelectCheckboxGroup({
  label,
  options,
  selected,
  onChange,
  class: className = '',
}: MultiSelectCheckboxGroupProps): JSX.Element {
  const handleToggle = (value: string, next: boolean, enabled: boolean) => {
    if (!enabled) return;

    onChange(next ? [...selected, value] : selected.filter((v) => v !== value));
  };

  return (
    <div class={`w-full ${className}`}>
      {label && (
        <label class="block text-xs font-semibold text-neutral-300 mb-1">
          {label}
        </label>
      )}
      <div class="rounded border border-neutral-700 bg-neutral-800 divide-y divide-neutral-700">
        {options.map((opt) => (
          <CheckboxRow
            key={opt.value}
            label={opt.label}
            checked={selected.includes(opt.value)}
            disabled={opt.enabled === false}
            onToggle={(next) =>
              handleToggle(opt.value, next as boolean, opt.enabled !== false)
            }
          />
        ))}
      </div>
    </div>
  );
}

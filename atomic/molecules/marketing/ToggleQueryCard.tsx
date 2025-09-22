import { classSet, JSX, useState } from '../../.deps.ts';
import { EyebrowLabel } from '../../atoms/marketing/EyebrowLabel.tsx';
import { TogglePillButton } from '../../atoms/marketing/TogglePillButton.tsx';

export type ToggleOption = {
  id: string;
  label: string;
};

export type ToggleQueryCardProps = {
  eyebrow?: JSX.Element | string;
  title: JSX.Element | string;
  description?: JSX.Element | string;
  options: ToggleOption[];
  copy: Record<string, string>;
} & JSX.HTMLAttributes<HTMLElement>;

export function ToggleQueryCard({
  eyebrow,
  title,
  description,
  options,
  copy,
  ...rest
}: ToggleQueryCardProps): JSX.Element | null {
  if (!options.length) {
    return null;
  }

  const [active, setActive] = useState(options[0]?.id);
  const activeCopy = active ? copy[active] ?? '' : '';

  return (
    <article
      {...rest}
      class={classSet(
        [
          'flex flex-col gap-4 rounded-2xl border border-neutral-200/80 bg-neutral-900/80 p-6 text-left shadow-lg dark:border-white/10 dark:bg-neutral-900',
        ],
        rest,
      )}
    >
      <div class='space-y-2'>
        {eyebrow ? <EyebrowLabel intent='accent'>{eyebrow}</EyebrowLabel> : null}
        <h3 class='text-lg font-semibold text-white'>{title}</h3>
        {description ? <p class='text-sm text-neutral-300'>{description}</p> : null}
      </div>

      <div class='flex gap-2 rounded-full bg-neutral-800/80 p-1 text-sm text-neutral-300'>
        {options.map((option) => (
          <TogglePillButton
            key={option.id}
            active={option.id === active}
            onClick={() => setActive(option.id)}
            class='flex-1 text-center'
          >
            {option.label}
          </TogglePillButton>
        ))}
      </div>

      <pre class='overflow-x-auto rounded-xl bg-neutral-950/80 p-4 text-sm text-neutral-200'>
        {activeCopy}
      </pre>
    </article>
  );
}

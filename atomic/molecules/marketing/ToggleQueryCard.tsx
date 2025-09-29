import { classSet, JSX, useEffect, useState } from '../../.deps.ts';
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
  copyClassName?: string;
  expandable?: boolean;
} & JSX.HTMLAttributes<HTMLElement>;

export function ToggleQueryCard({
  eyebrow,
  title,
  description,
  options,
  copy,
  copyClassName,
  expandable = false,
  ...rest
}: ToggleQueryCardProps): JSX.Element | null {
  if (!options.length) {
    return null;
  }

  const [active, setActive] = useState(options[0]?.id);
  const [expanded, setExpanded] = useState(false);
  const activeCopy = active ? copy[active] ?? '' : '';

  useEffect(() => {
    if (expandable) {
      setExpanded(false);
    }
  }, [active, expandable]);

  const handleOptionClick = (optionId: string) => {
    setActive(optionId);
    if (expandable) {
      setExpanded(false);
    }
  };

  const copyContainerClass = [
    'overflow-auto rounded-xl bg-neutral-950/80 p-4 text-sm text-neutral-200 whitespace-pre-wrap break-words sm:text-sm',
    expandable ? 'transition-[max-height] duration-200 ease-out' : '',
    expandable ? (expanded ? 'max-h-[32rem]' : 'max-h-48') : '',
    copyClassName ?? '',
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

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
            onClick={() => handleOptionClick(option.id)}
            class='flex-1 text-center'
          >
            {option.label}
          </TogglePillButton>
        ))}
      </div>

      <div class='flex flex-col gap-3'>
        <pre class={copyContainerClass}>{activeCopy}</pre>
        {expandable
          ? (
            <button
              type='button'
              onClick={() => setExpanded((state) => !state)}
              class='self-end text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-neutral-300 transition-colors duration-150 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40'
            >
              {expanded ? 'Collapse' : 'Expand'}
            </button>
          )
          : null}
      </div>
    </article>
  );
}

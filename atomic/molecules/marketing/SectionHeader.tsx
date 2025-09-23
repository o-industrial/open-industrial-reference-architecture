import { classSet, ComponentChildren, JSX } from '../../.deps.ts';
import { EyebrowLabel } from '../../atoms/marketing/EyebrowLabel.tsx';

export type SectionHeaderAlignment = 'left' | 'center';

export type SectionHeaderProps = {
  eyebrow?: ComponentChildren;
  title: ComponentChildren;
  description?: ComponentChildren;
  overline?: ComponentChildren;
  align?: SectionHeaderAlignment;
  kicker?: ComponentChildren;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'>;

export function SectionHeader({
  eyebrow,
  title,
  description,
  overline,
  align = 'left',
  kicker,
  ...rest
}: SectionHeaderProps): JSX.Element {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div
      {...rest}
      class={classSet(['space-y-4 max-w-3xl', alignment], rest)}
    >
      {overline
        ? <div class='text-sm text-neutral-500 dark:text-neutral-400'>{overline}</div>
        : null}
      {eyebrow ? <EyebrowLabel intent='accent'>{eyebrow}</EyebrowLabel> : null}
      <h2 class='text-3xl font-bold text-neutral-900 dark:text-neutral-50 sm:text-4xl'>{title}</h2>
      {description
        ? <p class='text-lg text-neutral-600 dark:text-neutral-300'>{description}</p>
        : null}
      {kicker ? <div class='text-sm text-neutral-500 dark:text-neutral-400'>{kicker}</div> : null}
    </div>
  );
}

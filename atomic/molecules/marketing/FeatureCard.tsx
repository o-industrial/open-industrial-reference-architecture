import { classSet, JSX } from '../../.deps.ts';
import {
  GradientIconBadge,
  type GradientIntent,
} from '../../atoms/marketing/GradientIconBadge.tsx';
import { ChipList } from '../../atoms/marketing/ChipList.tsx';

export type FeatureCardProps = {
  title: string;
  description: JSX.Element | string;
  icon?: JSX.ElementType;
  intent?: GradientIntent;
  highlights?: string[];
  chips?: string[];
} & JSX.HTMLAttributes<HTMLElement>;

export function FeatureCard({
  title,
  description,
  icon: Icon,
  intent = 'blue',
  highlights,
  chips,
  ...rest
}: FeatureCardProps): JSX.Element {
  return (
    <article
      {...rest}
      class={classSet(
        [
          'flex h-full flex-col gap-4 rounded-2xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm transition-colors hover:border-neutral-300 dark:border-white/10 dark:bg-neutral-950/80',
        ],
        rest,
      )}
    >
      {Icon ? <GradientIconBadge icon={Icon} intent={intent} /> : null}
      <div class='space-y-3'>
        <h3 class='text-xl font-semibold text-neutral-900 dark:text-white'>{title}</h3>
        <p class='text-sm text-neutral-600 dark:text-neutral-300'>{description}</p>
        {highlights?.length
          ? (
            <ul class='space-y-2 text-sm text-neutral-600 dark:text-neutral-400'>
              {highlights.map((item) => (
                <li key={item} class='flex items-start gap-2'>
                  <span class='mt-1 h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )
          : null}
      </div>
      {chips?.length ? <ChipList items={chips} /> : null}
    </article>
  );
}

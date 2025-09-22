import { classSet, JSX } from '../../.deps.ts';
import {
  GradientIconBadge,
  type GradientIntent,
} from '../../atoms/marketing/GradientIconBadge.tsx';

export type ChecklistItem = {
  icon?: JSX.ElementType;
  intent?: GradientIntent;
  title: JSX.Element | string;
  description?: JSX.Element | string;
};

export type ChecklistGroupProps = {
  items: ChecklistItem[];
  columns?: 1 | 2 | 3;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function ChecklistGroup({
  items,
  columns = 1,
  ...rest
}: ChecklistGroupProps): JSX.Element {
  const grid = columns === 1
    ? 'grid-cols-1'
    : columns === 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div
      {...rest}
      class={classSet(['grid gap-6', grid], rest)}
    >
      {items.map((item) => (
        <div
          key={String(item.title)}
          class='flex items-start gap-4 rounded-2xl border border-neutral-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-900/80'
        >
          {item.icon
            ? <GradientIconBadge icon={item.icon} intent={item.intent ?? 'blue'} size='md' />
            : <span class='mt-1 block h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-600' />}
          <div class='space-y-1'>
            <h4 class='text-base font-semibold text-neutral-900 dark:text-white'>{item.title}</h4>
            {item.description
              ? <p class='text-sm text-neutral-600 dark:text-neutral-400'>{item.description}</p>
              : null}
          </div>
        </div>
      ))}
    </div>
  );
}

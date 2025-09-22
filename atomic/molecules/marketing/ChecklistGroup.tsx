import { classSet, ComponentType, JSX } from '../../.deps.ts';
import {
  GradientIconBadge,
  type GradientIntent,
} from '../../atoms/marketing/GradientIconBadge.tsx';

const intentSurfaceMap: Record<GradientIntent, string> = {
  blue:
    'border-neon-blue-500/40 bg-neon-blue-500/10 dark:border-neon-blue-400/30 dark:bg-neon-blue-500/10',
  green:
    'border-emerald-500/40 bg-emerald-500/10 dark:border-emerald-400/30 dark:bg-emerald-500/10',
  purple:
    'border-neon-purple-500/40 bg-neon-purple-500/10 dark:border-neon-purple-400/30 dark:bg-neon-purple-500/10',
  orange: 'border-orange-500/40 bg-orange-500/10 dark:border-orange-400/30 dark:bg-orange-500/10',
};

const neutralSurface = 'border-neutral-200/80 bg-white/70 dark:border-white/10 dark:bg-white/5';

export type ChecklistItem = {
  icon?: ComponentType<JSX.SVGAttributes<SVGSVGElement>>;
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
      {items.map((item) => {
        const intentClass = item.intent ? intentSurfaceMap[item.intent] : neutralSurface;

        return (
          <div
            key={String(item.title)}
            class={classSet([
              'flex items-start gap-4 rounded-2xl border p-4 shadow-sm transition-colors backdrop-blur-sm',
              intentClass,
            ])}
          >
            {item.icon
              ? <GradientIconBadge icon={item.icon} intent={item.intent ?? 'blue'} size='md' />
              : <span class='mt-1 block h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-500' />}
            <div class='space-y-1'>
              <h4 class='text-base font-semibold text-neutral-900 dark:text-white'>{item.title}</h4>
              {item.description
                ? <p class='text-sm text-neutral-600 dark:text-neutral-300'>{item.description}</p>
                : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

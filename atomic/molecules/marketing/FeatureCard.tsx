import { classSet, ComponentType, JSX } from '../../.deps.ts';
import {
  GradientIconBadge,
  type GradientIntent,
} from '../../atoms/marketing/GradientIconBadge.tsx';
import { ChipList } from '../../atoms/marketing/ChipList.tsx';

const intentSurfaceMap: Record<GradientIntent, string> = {
  blue:
    'border-neon-blue-500/40 bg-neon-blue-500/10 dark:border-neon-blue-400/30 dark:bg-neon-blue-500/5',
  green: 'border-emerald-500/40 bg-emerald-500/10 dark:border-emerald-400/30 dark:bg-emerald-500/5',
  purple:
    'border-neon-purple-500/40 bg-neon-purple-500/10 dark:border-neon-purple-400/30 dark:bg-neon-purple-500/5',
  orange: 'border-orange-500/40 bg-orange-500/10 dark:border-orange-400/30 dark:bg-orange-500/5',
};

export type FeatureCardProps = {
  title: string;
  description: JSX.Element | string;
  icon?: ComponentType<JSX.SVGAttributes<SVGSVGElement>>;
  intent?: GradientIntent;
  highlights?: string[];
  chips?: string[];
} & Omit<JSX.HTMLAttributes<HTMLElement>, 'icon'>;

export function FeatureCard({
  title,
  description,
  icon: Icon,
  intent = 'blue',
  highlights,
  chips,
  ...rest
}: FeatureCardProps): JSX.Element {
  const surfaceIntent = intentSurfaceMap[intent] ?? intentSurfaceMap.blue;

  return (
    <article
      {...rest}
      class={classSet(
        [
          'flex h-full flex-col gap-4 rounded-2xl border bg-white/70 p-6 shadow-sm transition-colors dark:bg-white/5',
          surfaceIntent,
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
            <ul class='space-y-2 text-sm text-neutral-600 dark:text-neutral-300'>
              {highlights.map((item) => (
                <li key={item} class='flex items-start gap-2'>
                  <span class='mt-1 h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500' />
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

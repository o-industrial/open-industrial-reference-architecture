import { classSet, ComponentType, JSX } from '../../.deps.ts';
import {
  GradientIconBadge,
  type GradientIntent,
} from '../../atoms/marketing/GradientIconBadge.tsx';
import { ChipList } from '../../atoms/marketing/ChipList.tsx';

const intentSurfaceMap: Record<GradientIntent, string> = {
  blue:
    'border-neon-blue-500/40 bg-gradient-to-br from-[#ebf4ff]/80 via-white/90 to-[#e6f2ff]/75 dark:border-neon-blue-400/25 dark:from-[#0d1a33]/70 dark:via-[#0f1f3f]/65 dark:to-[#08142a]/75',
  green:
    'border-emerald-500/40 bg-gradient-to-br from-[#e6f9f1]/80 via-white/90 to-[#eafef6]/75 dark:border-emerald-400/25 dark:from-[#0a261a]/70 dark:via-[#0f2f22]/65 dark:to-[#071a12]/75',
  purple:
    'border-neon-purple-500/40 bg-gradient-to-br from-[#f1edff]/80 via-white/90 to-[#ede9ff]/75 dark:border-neon-purple-400/25 dark:from-[#19143a]/70 dark:via-[#221a52]/65 dark:to-[#120f2d]/75',
  orange:
    'border-orange-500/40 bg-gradient-to-br from-[#fff4eb]/80 via-white/90 to-[#fff1e4]/75 dark:border-orange-400/25 dark:from-[#2d1708]/70 dark:via-[#351d0d]/65 dark:to-[#1f1309]/75',
};

const intentGlowMap: Record<GradientIntent, string> = {
  blue:
    'from-[rgba(107,169,255,0.35)] via-[rgba(181,212,255,0.15)] to-transparent dark:from-[rgba(77,171,255,0.4)] dark:via-[rgba(56,130,255,0.2)] dark:to-transparent',
  green:
    'from-[rgba(74,222,128,0.35)] via-[rgba(190,239,210,0.15)] to-transparent dark:from-[rgba(22,163,74,0.4)] dark:via-[rgba(45,212,191,0.2)] dark:to-transparent',
  purple:
    'from-[rgba(167,139,250,0.35)] via-[rgba(205,193,255,0.15)] to-transparent dark:from-[rgba(129,140,248,0.4)] dark:via-[rgba(167,139,250,0.2)] dark:to-transparent',
  orange:
    'from-[rgba(251,146,60,0.35)] via-[rgba(255,213,170,0.15)] to-transparent dark:from-[rgba(249,115,22,0.4)] dark:via-[rgba(251,146,60,0.2)] dark:to-transparent',
};

const bulletAccentMap: Record<GradientIntent, string> = {
  blue: 'bg-gradient-to-r from-neon-blue-500 to-sky-400 dark:from-neon-blue-400 dark:to-sky-500',
  green:
    'bg-gradient-to-r from-emerald-500 to-emerald-300 dark:from-emerald-400 dark:to-teal-400',
  purple:
    'bg-gradient-to-r from-neon-purple-500 to-indigo-400 dark:from-neon-purple-400 dark:to-indigo-500',
  orange: 'bg-gradient-to-r from-orange-500 to-amber-400 dark:from-orange-400 dark:to-amber-500',
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
          'group relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl border p-6 shadow-[0_30px_80px_-60px_rgba(62,45,171,0.45)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_45px_120px_-60px_rgba(62,45,171,0.5)]',
          surfaceIntent,
        ],
        rest,
      )}
    >
      <div
        aria-hidden='true'
        class={classSet([
          'pointer-events-none absolute -top-28 right-[-25%] h-64 w-64 rounded-full bg-gradient-to-br opacity-70 blur-3xl transition-opacity duration-500 group-hover:opacity-100',
          intentGlowMap[intent],
        ])}
      />
      <div class='relative flex items-start gap-4'>
        {Icon ? (
          <GradientIconBadge
            icon={Icon}
            intent={intent}
            size='md'
            class='shadow-lg'
          />
        ) : null}
        <div class='space-y-3'>
          <h3 class='text-xl font-semibold text-neutral-900 dark:text-white'>
            {title}
          </h3>
          <p class='text-sm text-neutral-600 dark:text-neutral-300'>{description}</p>
        </div>
      </div>

      {highlights?.length
        ? (
          <ul class='relative space-y-2 rounded-2xl border border-white/70 bg-white/70 p-4 text-sm text-neutral-600 shadow-inner dark:border-white/10 dark:bg-white/5 dark:text-neutral-300'>
            {highlights.map((item) => (
              <li key={item} class='flex items-start gap-3'>
                <span
                  class={classSet([
                    'mt-1 h-2 w-2 rounded-full',
                    bulletAccentMap[intent],
                  ])}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )
        : null}

      {chips?.length
        ? (
          <div class='relative mt-auto'>
            <ChipList
              items={chips}
              class='flex flex-wrap gap-2'
              chipClass='rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm dark:bg-white/10 dark:text-neutral-200'
            />
          </div>
        )
        : null}
    </article>
  );
}

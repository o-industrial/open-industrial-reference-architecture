import { classSet, ComponentType, JSX } from '../../.deps.ts';
import {
  GradientIconBadge,
  type GradientIntent,
} from '../../atoms/marketing/GradientIconBadge.tsx';

const intentSurfaceMap: Record<GradientIntent, string> = {
  blue:
    'border-neon-blue-500/40 bg-gradient-to-br from-[#e6f2ff]/80 via-white/90 to-[#eaf6ff]/75 dark:border-neon-blue-400/25 dark:from-[#0b162f]/70 dark:via-[#101d3b]/65 dark:to-[#071226]/75',
  green:
    'border-emerald-500/40 bg-gradient-to-br from-[#e6f9f1]/80 via-white/90 to-[#eafef6]/75 dark:border-emerald-400/25 dark:from-[#0a261a]/70 dark:via-[#0f2f22]/65 dark:to-[#071a12]/75',
  purple:
    'border-neon-purple-500/40 bg-gradient-to-br from-[#f3efff]/80 via-white/90 to-[#eee8ff]/75 dark:border-neon-purple-400/25 dark:from-[#19143a]/70 dark:via-[#221a52]/65 dark:to-[#120f2d]/75',
  orange:
    'border-orange-500/40 bg-gradient-to-br from-[#fff4eb]/80 via-white/90 to-[#fff0e2]/75 dark:border-orange-400/25 dark:from-[#2d1708]/70 dark:via-[#351d0d]/65 dark:to-[#1f1309]/75',
};

const intentGlowMap: Record<GradientIntent, string> = {
  blue:
    'from-[rgba(96,165,250,0.28)] via-[rgba(191,219,254,0.12)] to-transparent dark:from-[rgba(37,99,235,0.32)] dark:via-[rgba(56,130,255,0.18)] dark:to-transparent',
  green:
    'from-[rgba(52,211,153,0.3)] via-[rgba(178,245,234,0.12)] to-transparent dark:from-[rgba(16,185,129,0.32)] dark:via-[rgba(45,212,191,0.18)] dark:to-transparent',
  purple:
    'from-[rgba(167,139,250,0.3)] via-[rgba(221,214,254,0.12)] to-transparent dark:from-[rgba(129,140,248,0.32)] dark:via-[rgba(167,139,250,0.18)] dark:to-transparent',
  orange:
    'from-[rgba(251,146,60,0.3)] via-[rgba(254,215,170,0.12)] to-transparent dark:from-[rgba(249,115,22,0.32)] dark:via-[rgba(251,146,60,0.18)] dark:to-transparent',
};

const neutralSurface =
  'border-white/60 bg-white/80 dark:border-white/10 dark:bg-white/5';
const neutralGlow =
  'from-[rgba(148,163,184,0.22)] via-[rgba(226,232,240,0.1)] to-transparent dark:from-[rgba(148,163,184,0.18)] dark:via-[rgba(148,163,184,0.12)] dark:to-transparent';

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
        const surfaceClass = item.intent
          ? intentSurfaceMap[item.intent]
          : neutralSurface;
        const glowClass = item.intent
          ? intentGlowMap[item.intent]
          : neutralGlow;

        return (
          <div
            key={String(item.title)}
            class={classSet([
              'group relative flex items-start gap-4 overflow-hidden rounded-3xl border p-5 shadow-[0_28px_80px_-60px_rgba(62,45,171,0.45)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_42px_120px_-70px_rgba(62,45,171,0.55)]',
              surfaceClass,
            ])}
          >
            <div
              aria-hidden='true'
              class={classSet([
                'pointer-events-none absolute -top-24 right-[-35%] h-56 w-56 rounded-full bg-gradient-to-br opacity-70 blur-3xl transition-opacity duration-500 group-hover:opacity-100',
                glowClass,
              ])}
            />
            {item.icon
              ? (
                <GradientIconBadge
                  icon={item.icon}
                  intent={item.intent ?? 'blue'}
                  size='md'
                  class='relative shadow-lg'
                />
              )
              : (
                <span class='relative mt-2 block h-2 w-2 rounded-full bg-gradient-to-r from-neutral-400 to-neutral-300 dark:from-neutral-500 dark:to-neutral-400' />
              )}
            <div class='relative space-y-2'>
              <h4 class='text-base font-semibold text-neutral-900 dark:text-white'>
                {item.title}
              </h4>
              {item.description
                ? (
                  <p class='text-sm text-neutral-600 dark:text-neutral-300'>
                    {item.description}
                  </p>
                )
                : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

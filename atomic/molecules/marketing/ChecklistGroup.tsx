import { classSet, ComponentType, JSX } from '../../.deps.ts';
import {
  GradientIconBadge,
  type GradientIntent,
} from '../../atoms/marketing/GradientIconBadge.tsx';

type ChecklistVariant = 'light' | 'dark';

type SurfaceIntent = GradientIntent | 'neutral';

const cardSurfaceVariants: Record<ChecklistVariant, Record<SurfaceIntent, string>> = {
  light: {
    blue:
      'border-neon-blue-500/40 bg-gradient-to-br from-[rgba(219,234,254,0.8)] via-white/90 to-[rgba(239,246,255,0.75)] dark:border-neon-blue-400/25 dark:from-[rgba(11,22,47,0.7)] dark:via-[rgba(16,29,59,0.65)] dark:to-[rgba(7,18,38,0.75)]',
    green:
      'border-neon-green-500/40 bg-gradient-to-br from-[rgba(209,250,229,0.8)] via-white/90 to-[rgba(234,254,246,0.75)] dark:border-neon-green-400/25 dark:from-[rgba(10,38,26,0.7)] dark:via-[rgba(15,47,34,0.65)] dark:to-[rgba(7,26,18,0.75)]',
    purple:
      'border-neon-purple-500/40 bg-gradient-to-br from-[rgba(243,239,255,0.8)] via-white/90 to-[rgba(238,232,255,0.75)] dark:border-neon-purple-400/25 dark:from-[rgba(25,20,58,0.7)] dark:via-[rgba(34,26,82,0.65)] dark:to-[rgba(18,15,45,0.75)]',
    orange:
      'border-neon-orange-500/40 bg-gradient-to-br from-[rgba(255,244,235,0.8)] via-white/90 to-[rgba(255,240,226,0.75)] dark:border-neon-orange-400/25 dark:from-[rgba(45,23,8,0.7)] dark:via-[rgba(53,29,13,0.65)] dark:to-[rgba(31,19,9,0.75)]',
    neutral:
      'border-white/60 bg-white/80 dark:border-white/10 dark:bg-white/5',
  },
  dark: {
    blue:
      'border-neon-blue-500/35 bg-[linear-gradient(135deg,rgba(20,36,74,0.82),rgba(8,13,30,0.94))]',
    green:
      'border-neon-green-400/35 bg-[linear-gradient(135deg,rgba(16,44,32,0.82),rgba(8,14,26,0.94))]',
    purple:
      'border-neon-purple-500/35 bg-[linear-gradient(135deg,rgba(36,24,64,0.82),rgba(11,13,32,0.95))]',
    orange:
      'border-neon-orange-400/35 bg-[linear-gradient(135deg,rgba(54,29,18,0.82),rgba(18,12,28,0.95))]',
    neutral:
      'border-white/12 bg-[linear-gradient(135deg,rgba(18,22,36,0.82),rgba(7,10,22,0.94))]',
  },
};

const cardGlowVariants: Record<ChecklistVariant, Record<SurfaceIntent, string>> = {
  light: {
    blue:
      'from-[rgba(96,165,250,0.28)] via-[rgba(191,219,254,0.12)] to-transparent dark:from-[rgba(37,99,235,0.32)] dark:via-[rgba(56,130,255,0.18)] dark:to-transparent',
    green:
      'from-[rgba(52,211,153,0.3)] via-[rgba(178,245,234,0.12)] to-transparent dark:from-[rgba(16,185,129,0.32)] dark:via-[rgba(45,212,191,0.18)] dark:to-transparent',
    purple:
      'from-[rgba(167,139,250,0.3)] via-[rgba(221,214,254,0.12)] to-transparent dark:from-[rgba(129,140,248,0.32)] dark:via-[rgba(167,139,250,0.18)] dark:to-transparent',
    orange:
      'from-[rgba(251,146,60,0.3)] via-[rgba(254,215,170,0.12)] to-transparent dark:from-[rgba(249,115,22,0.32)] dark:via-[rgba(251,146,60,0.18)] dark:to-transparent',
    neutral:
      'from-[rgba(148,163,184,0.22)] via-[rgba(226,232,240,0.1)] to-transparent dark:from-[rgba(148,163,184,0.18)] dark:via-[rgba(148,163,184,0.12)] dark:to-transparent',
  },
  dark: {
    blue: 'from-[rgba(56,130,255,0.34)] via-[rgba(45,95,210,0.16)] to-transparent',
    green: 'from-[rgba(45,212,191,0.32)] via-[rgba(52,211,153,0.14)] to-transparent',
    purple: 'from-[rgba(167,139,250,0.36)] via-[rgba(129,140,248,0.18)] to-transparent',
    orange: 'from-[rgba(251,146,60,0.34)] via-[rgba(249,115,22,0.16)] to-transparent',
    neutral: 'from-[rgba(148,163,184,0.28)] via-[rgba(148,163,184,0.14)] to-transparent',
  },
};

const baseCardClass: Record<ChecklistVariant, string> = {
  light:
    'group relative flex items-start gap-4 overflow-hidden rounded-3xl border p-5 shadow-[0_28px_80px_-60px_rgba(62,45,171,0.45)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_42px_120px_-70px_rgba(62,45,171,0.55)]',
  dark:
    'group relative flex items-start gap-4 overflow-hidden rounded-3xl border p-6 shadow-[0_36px_120px_-82px_rgba(12,17,46,0.9)] backdrop-blur-[2px] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_52px_150px_-95px_rgba(20,26,68,0.9)]',
};

export type ChecklistItem = {
  icon?: ComponentType<JSX.SVGAttributes<SVGSVGElement>>;
  intent?: GradientIntent;
  title: JSX.Element | string;
  description?: JSX.Element | string;
};

export type ChecklistGroupProps = {
  items: ChecklistItem[];
  columns?: 1 | 2 | 3;
  variant?: ChecklistVariant;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function ChecklistGroup({
  items,
  columns = 1,
  variant = 'light',
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
        const intent = (item.intent ?? 'neutral') as SurfaceIntent;
        const surfaceClass = cardSurfaceVariants[variant][intent];
        const glowClass = cardGlowVariants[variant][intent];

        return (
          <div
            key={String(item.title)}
            class={classSet([
              baseCardClass[variant],
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
                  class={`relative shadow-lg${variant === 'dark' ? ' shadow-black/40' : ''}`}
                />
              )
              : (
                <span
                  class={`relative mt-2 block h-2 w-2 rounded-full bg-gradient-to-r ${
                    variant === 'dark'
                      ? 'from-white/80 to-white/60'
                      : 'from-neutral-400 to-neutral-300 dark:from-neutral-500 dark:to-neutral-400'
                  }`}
                />
              )}
            <div class='relative space-y-2'>
              <h4
                class={
                  variant === 'dark'
                    ? 'text-base font-semibold text-white'
                    : 'text-base font-semibold text-neutral-900 dark:text-white'
                }
              >
                {item.title}
              </h4>
              {item.description
                ? (
                  <p
                    class={
                      variant === 'dark'
                        ? 'text-sm text-indigo-100/85'
                        : 'text-sm text-neutral-600 dark:text-neutral-300'
                    }
                  >
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

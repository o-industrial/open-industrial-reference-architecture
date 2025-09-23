import { classSet, JSX } from '../../.deps.ts';
import type { GradientIntent } from '../../atoms/marketing/GradientIconBadge.tsx';

type QuoteCardVariant = 'light' | 'dark';

type AccentPalette = Record<GradientIntent, { top: string; bottom: string }>;

const quoteSurfaceVariants: Record<QuoteCardVariant, string> = {
  light:
    'group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-[#f2efff] via-[#f8f5ff] to-[#e8f4ff] p-6 text-left shadow-[0_35px_90px_-70px_rgba(62,45,171,0.55)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_50px_140px_-80px_rgba(62,45,171,0.6)] dark:border-white/10 dark:from-[#181436] dark:via-[#261d58] dark:to-[#0d1d3d]',
  dark:
    'group relative overflow-hidden rounded-[24px] border border-white/12 bg-[linear-gradient(130deg,rgba(19,23,44,0.92),rgba(8,11,26,0.96))] p-6 text-left shadow-[0_38px_140px_-110px_rgba(10,14,42,0.95)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_60px_170px_-120px_rgba(18,28,76,0.95)]',
};

const glowPalettes: Record<QuoteCardVariant, AccentPalette> = {
  light: {
    purple: {
      top: 'bg-neon-purple-500/25 dark:bg-neon-purple-500/30',
      bottom: 'bg-neon-blue-400/25 dark:bg-neon-blue-400/30',
    },
    blue: {
      top: 'bg-neon-blue-500/25 dark:bg-neon-blue-500/30',
      bottom: 'bg-emerald-400/25 dark:bg-emerald-400/30',
    },
    green: {
      top: 'bg-emerald-400/25 dark:bg-emerald-400/30',
      bottom: 'bg-neon-blue-400/25 dark:bg-neon-blue-400/30',
    },
    orange: {
      top: 'bg-orange-400/25 dark:bg-orange-400/30',
      bottom: 'bg-neon-purple-500/25 dark:bg-neon-purple-500/30',
    },
  },
  dark: {
    purple: {
      top: 'bg-[rgba(149,108,255,0.38)]',
      bottom: 'bg-[rgba(94,234,255,0.26)]',
    },
    blue: {
      top: 'bg-[rgba(82,134,255,0.32)]',
      bottom: 'bg-[rgba(56,189,248,0.22)]',
    },
    green: {
      top: 'bg-[rgba(45,212,191,0.28)]',
      bottom: 'bg-[rgba(134,239,172,0.22)]',
    },
    orange: {
      top: 'bg-[rgba(251,146,60,0.3)]',
      bottom: 'bg-[rgba(251,113,133,0.24)]',
    },
  },
};

const quoteTextClass: Record<QuoteCardVariant, string> = {
  light: 'relative text-lg font-medium leading-7 text-neutral-900 dark:text-neutral-100',
  dark: 'relative text-lg font-medium leading-snug text-white/85',
};

const metaClass: Record<QuoteCardVariant, string> = {
  light: 'relative mt-6 text-sm text-neutral-600 dark:text-neutral-300',
  dark: 'relative mt-5 text-sm text-white/60',
};

const nameClass: Record<QuoteCardVariant, string> = {
  light: 'font-semibold text-neutral-900 dark:text-white',
  dark: 'font-semibold text-white/85',
};

const topGlowBase =
  'pointer-events-none absolute -left-14 top-6 h-40 w-40 rounded-full opacity-0 blur-[110px] transition-opacity duration-500 group-hover:opacity-100';
const bottomGlowBase =
  'pointer-events-none absolute -bottom-16 right-[-10%] h-52 w-56 rounded-full opacity-0 blur-[120px] transition-opacity duration-500 group-hover:opacity-100';

export type QuoteCardProps = {
  quote: JSX.Element | string;
  attribution?: JSX.Element | string;
  role?: JSX.Element | string;
  variant?: QuoteCardVariant;
  intent?: GradientIntent;
} & Omit<JSX.HTMLAttributes<HTMLElement>, 'role'>;

export function QuoteCard({
  quote,
  attribution,
  role,
  variant = 'light',
  intent = 'purple',
  ...rest
}: QuoteCardProps): JSX.Element {
  const glowPalette = glowPalettes[variant][intent];

  return (
    <figure
      {...rest}
      class={classSet([quoteSurfaceVariants[variant]], rest)}
    >
      <div
        aria-hidden='true'
        class={classSet([topGlowBase, glowPalette.top])}
      />
      <div
        aria-hidden='true'
        class={classSet([bottomGlowBase, glowPalette.bottom])}
      />
      <blockquote class={quoteTextClass[variant]}>
        &quot;{quote}&quot;
      </blockquote>
      {(attribution || role)
        ? (
          <figcaption class={metaClass[variant]}>
            {attribution ? <div class={nameClass[variant]}>{attribution}</div> : null}
            {role ? <div>{role}</div> : null}
          </figcaption>
        )
        : null}
    </figure>
  );
}

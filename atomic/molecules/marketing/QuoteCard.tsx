import { classSet, JSX } from '../../.deps.ts';
import type { GradientIntent } from '../../atoms/marketing/GradientIconBadge.tsx';

type QuoteCardVariant = 'light' | 'dark';

type AccentPalette = Record<GradientIntent, { top: string; bottom: string }>;

const quoteSurfaceVariants: Record<QuoteCardVariant, string> = {
  light:
    'group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-[#f2efff] via-[#f8f5ff] to-[#e8f4ff] p-6 text-left shadow-[0_35px_90px_-70px_rgba(62,45,171,0.55)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_50px_140px_-80px_rgba(62,45,171,0.6)] dark:border-white/10 dark:from-[#181436] dark:via-[#261d58] dark:to-[#0d1d3d]',
  dark:
    'group relative overflow-hidden rounded-[26px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(58,48,138,0.32),rgba(8,11,25,0.92))] p-6 text-left shadow-[0_40px_140px_-100px_rgba(10,14,40,0.95)] backdrop-blur-[1.5px] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_58px_180px_-120px_rgba(18,26,76,0.95)]',
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
      top: 'bg-[rgba(149,108,255,0.45)]',
      bottom: 'bg-[rgba(94,234,255,0.28)]',
    },
    blue: {
      top: 'bg-[rgba(82,134,255,0.38)]',
      bottom: 'bg-[rgba(56,189,248,0.26)]',
    },
    green: {
      top: 'bg-[rgba(45,212,191,0.32)]',
      bottom: 'bg-[rgba(134,239,172,0.26)]',
    },
    orange: {
      top: 'bg-[rgba(251,146,60,0.36)]',
      bottom: 'bg-[rgba(251,113,133,0.28)]',
    },
  },
};

const quoteTextClass: Record<QuoteCardVariant, string> = {
  light: 'relative text-lg font-medium leading-7 text-neutral-900 dark:text-neutral-100',
  dark: 'relative text-lg font-medium leading-snug text-white/88',
};

const metaClass: Record<QuoteCardVariant, string> = {
  light: 'relative mt-6 text-sm text-neutral-600 dark:text-neutral-300',
  dark: 'relative mt-6 text-xs uppercase tracking-[0.3em] text-white/55',
};

const nameClass: Record<QuoteCardVariant, string> = {
  light: 'font-semibold text-neutral-900 dark:text-white',
  dark: 'mb-1 text-sm font-semibold uppercase tracking-[0.24em] text-white/75',
};

const topGlowBase =
  'pointer-events-none absolute -left-12 top-4 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-90';
const bottomGlowBase =
  'pointer-events-none absolute -bottom-14 right-[-8%] h-48 w-52 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-90';

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

import { classSet, ComponentType, JSX } from '../../.deps.ts';
import {
  GradientIconBadge,
  type GradientIntent,
} from '../../atoms/marketing/GradientIconBadge.tsx';
import { ChipList } from '../../atoms/marketing/ChipList.tsx';

type FeatureCardVariant = 'light' | 'dark';

type IntentDecor = {
  badge: string;
  halo: string;
  promptBackground: string;
  promptBorder: string;
  promptText: string;
};

type VariantDecor = {
  base: string;
  title: string;
  body: string;
  promptLabel: string;
  chip: string;
  intents: Record<GradientIntent, IntentDecor>;
};

const darkVariant: VariantDecor = {
  base:
    'group relative flex h-full flex-col gap-6 overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-br from-slate-950/85 via-slate-950/70 to-slate-950/90 p-8 shadow-[0_42px_160px_-110px_rgba(8,12,32,0.88)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_70px_210px_-130px_rgba(12,20,48,0.9)]',
  title: 'text-xl font-semibold text-white',
  body: 'text-sm text-white/78',
  promptLabel: 'text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/70',
  chip: 'rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 shadow-sm backdrop-blur-sm',
  intents: {
    blue: {
      badge: 'bg-gradient-to-br from-neon-blue-500 via-sky-500 to-indigo-500 shadow-[0_0_25px_-6px_rgba(90,130,255,0.55)]',
      halo: 'bg-neon-blue-500/25',
      promptBackground: 'bg-gradient-to-r from-neon-blue-500/30 via-sky-500/20 to-neon-blue-400/30',
      promptBorder: 'border-neon-blue-400/60',
      promptText: 'text-sky-100',
    },
    green: {
      badge: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 shadow-[0_0_25px_-6px_rgba(34,197,94,0.55)]',
      halo: 'bg-emerald-400/25',
      promptBackground: 'bg-gradient-to-r from-emerald-400/30 via-teal-400/20 to-emerald-500/30',
      promptBorder: 'border-emerald-400/60',
      promptText: 'text-emerald-100',
    },
    purple: {
      badge: 'bg-gradient-to-br from-neon-purple-500 via-violet-500 to-indigo-500 shadow-[0_0_25px_-6px_rgba(167,139,250,0.55)]',
      halo: 'bg-neon-purple-500/25',
      promptBackground: 'bg-gradient-to-r from-neon-purple-500/30 via-violet-500/20 to-indigo-500/30',
      promptBorder: 'border-neon-purple-500/60',
      promptText: 'text-violet-100',
    },
    orange: {
      badge: 'bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 shadow-[0_0_25px_-6px_rgba(251,146,60,0.55)]',
      halo: 'bg-orange-400/25',
      promptBackground: 'bg-gradient-to-r from-orange-400/30 via-amber-400/20 to-orange-500/30',
      promptBorder: 'border-orange-400/60',
      promptText: 'text-amber-100',
    },
  },
};

const lightVariant: VariantDecor = {
  base:
    'group relative flex h-full flex-col gap-6 overflow-hidden rounded-[28px] border border-white/50 bg-gradient-to-br from-white via-slate-50 to-white p-8 shadow-[0_35px_140px_-100px_rgba(95,110,160,0.28)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_55px_180px_-120px_rgba(95,110,160,0.35)]',
  title: 'text-xl font-semibold text-slate-900',
  body: 'text-sm text-slate-600',
  promptLabel: 'text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-400',
  chip: 'rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm',
  intents: {
    blue: {
      badge: 'bg-gradient-to-br from-neon-blue-500 via-sky-500 to-indigo-500 shadow-[0_0_18px_-6px_rgba(59,130,246,0.35)]',
      halo: 'bg-neon-blue-500/15',
      promptBackground: 'bg-gradient-to-r from-sky-100 via-sky-50 to-indigo-100',
      promptBorder: 'border-sky-300',
      promptText: 'text-sky-700',
    },
    green: {
      badge: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 shadow-[0_0_18px_-6px_rgba(34,197,94,0.35)]',
      halo: 'bg-emerald-400/15',
      promptBackground: 'bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100',
      promptBorder: 'border-emerald-300',
      promptText: 'text-emerald-700',
    },
    purple: {
      badge: 'bg-gradient-to-br from-neon-purple-500 via-violet-500 to-indigo-500 shadow-[0_0_18px_-6px_rgba(167,139,250,0.35)]',
      halo: 'bg-neon-purple-500/15',
      promptBackground: 'bg-gradient-to-r from-violet-100 via-violet-50 to-indigo-100',
      promptBorder: 'border-violet-300',
      promptText: 'text-violet-700',
    },
    orange: {
      badge: 'bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 shadow-[0_0_18px_-6px_rgba(251,146,60,0.35)]',
      halo: 'bg-orange-400/15',
      promptBackground: 'bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100',
      promptBorder: 'border-amber-300',
      promptText: 'text-amber-700',
    },
  },
};

function getVariantDecor(variant: FeatureCardVariant): VariantDecor {
  return variant === 'dark' ? darkVariant : lightVariant;
}

export type FeatureCardProps = {
  title: string;
  description: JSX.Element | string;
  icon?: ComponentType<JSX.SVGAttributes<SVGSVGElement>>;
  intent?: GradientIntent;
  highlights?: string[];
  chips?: string[];
  variant?: FeatureCardVariant;
  index?: number;
  showIndexBadge?: boolean;
} & Omit<JSX.HTMLAttributes<HTMLElement>, 'icon'>;

export function FeatureCard({
  title,
  description,
  icon: Icon,
  intent = 'blue',
  highlights,
  chips,
  variant = 'dark',
  index,
  showIndexBadge = false,
  ...rest
}: FeatureCardProps): JSX.Element {
  const variantDecor = getVariantDecor(variant);
  const intentDecor = variantDecor.intents[intent] ?? variantDecor.intents.blue;
  const displayIndex = showIndexBadge && typeof index === 'number'
    ? index + 1
    : undefined;

  return (
    <article
      {...rest}
      class={classSet([variantDecor.base], rest)}
    >
      <div
        aria-hidden='true'
        class={`pointer-events-none absolute -top-16 -left-10 h-48 w-48 rounded-full ${intentDecor.halo} blur-[110px] transition-opacity duration-500 group-hover:opacity-95`}
      />

      <div class='relative flex items-start gap-5'>
        {displayIndex !== undefined
          ? (
            <span
              class={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-semibold text-white ${intentDecor.badge}`}
            >
              {String(displayIndex).padStart(2, '0')}
            </span>
          )
          : Icon
          ? (
            <GradientIconBadge
              icon={Icon}
              intent={intent}
              size='md'
              class='shadow-lg shadow-black/30'
            />
          )
          : null}
        <div class='space-y-3'>
          <h3 class={variantDecor.title}>
            {title}
          </h3>
          <p class={variantDecor.body}>
            {description}
          </p>
        </div>
      </div>

      {highlights?.length
        ? (
          <div class='relative mt-2 flex flex-col gap-2'>
            <span class={variantDecor.promptLabel}>
              Prompt
            </span>
            <span
              class={`inline-flex items-center justify-between gap-4 rounded-[18px] border px-5 py-3 text-sm font-medium ${intentDecor.promptBackground} ${intentDecor.promptBorder} ${intentDecor.promptText}`}
            >
              “{highlights[0]}”
            </span>
          </div>
        )
        : null}

      {chips?.length
        ? (
          <div class='relative mt-auto'>
            <ChipList
              items={chips}
              class='flex flex-wrap gap-2'
              chipClass={variantDecor.chip}
            />
          </div>
        )
        : null}
    </article>
  );
}

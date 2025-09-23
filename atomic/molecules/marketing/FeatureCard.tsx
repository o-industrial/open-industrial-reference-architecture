import { classSet, ComponentType, JSX } from '../../.deps.ts';
import {
  GradientIconBadge,
  type GradientIntent,
} from '../../atoms/marketing/GradientIconBadge.tsx';
import { ChipList } from '../../atoms/marketing/ChipList.tsx';

type FeatureCardVariant = 'light' | 'dark';

type SurfaceMap = Record<FeatureCardVariant, Record<GradientIntent, string>>;

type GlowMap = Record<FeatureCardVariant, Record<GradientIntent, string>>;

type BulletMap = Record<FeatureCardVariant, Record<GradientIntent, string>>;

type HighlightContainerMap = Record<FeatureCardVariant, string>;

type ChipMap = Record<FeatureCardVariant, string>;

type DescriptionMap = Record<FeatureCardVariant, string>;

type TitleMap = Record<FeatureCardVariant, string>;

type IndexBadgeMap = Record<GradientIntent, string>;

type HighlightAccentMap = Record<GradientIntent, string>;

type HighlightBorderMap = Record<GradientIntent, string>;

type HighlightTextMap = Record<GradientIntent, string>;

const surfaceMap: SurfaceMap = {
  light: {
    blue:
      'border-neon-blue-500/40 bg-gradient-to-br from-[#ebf4ff]/80 via-white/90 to-[#e6f2ff]/75 dark:border-neon-blue-400/25 dark:from-[#0d1a33]/70 dark:via-[#0f1f3f]/65 dark:to-[#08142a]/75',
    green:
      'border-emerald-500/40 bg-gradient-to-br from-[#e6f9f1]/80 via-white/90 to-[#eafef6]/75 dark:border-emerald-400/25 dark:from-[#0a261a]/70 dark:via-[#0f2f22]/65 dark:to-[#071a12]/75',
    purple:
      'border-neon-purple-500/40 bg-gradient-to-br from-[#f1edff]/80 via-white/90 to-[#ede9ff]/75 dark:border-neon-purple-400/25 dark:from-[#19143a]/70 dark:via-[#221a52]/65 dark:to-[#120f2d]/75',
    orange:
      'border-orange-500/40 bg-gradient-to-br from-[#fff4eb]/80 via-white/90 to-[#fff1e4]/75 dark:border-orange-400/25 dark:from-[#2d1708]/70 dark:via-[#351d0d]/65 dark:to-[#1f1309]/75',
  },
  dark: {
    blue:
      'border-[rgba(99,132,255,0.35)] bg-[linear-gradient(152deg,rgba(18,24,48,0.96),rgba(8,11,24,0.94))]',
    green:
      'border-[rgba(34,197,142,0.32)] bg-[linear-gradient(152deg,rgba(14,32,28,0.94),rgba(6,12,18,0.94))]',
    purple:
      'border-[rgba(167,139,250,0.34)] bg-[linear-gradient(152deg,rgba(28,22,60,0.94),rgba(10,12,28,0.95))]',
    orange:
      'border-[rgba(249,115,22,0.34)] bg-[linear-gradient(152deg,rgba(44,24,18,0.94),rgba(16,12,22,0.95))]',
  },
};

const glowMap: GlowMap = {
  light: {
    blue:
      'from-[rgba(107,169,255,0.35)] via-[rgba(181,212,255,0.15)] to-transparent dark:from-[rgba(77,171,255,0.4)] dark:via-[rgba(56,130,255,0.2)] dark:to-transparent',
    green:
      'from-[rgba(74,222,128,0.35)] via-[rgba(190,239,210,0.15)] to-transparent dark:from-[rgba(22,163,74,0.4)] dark:via-[rgba(45,212,191,0.2)] dark:to-transparent',
    purple:
      'from-[rgba(167,139,250,0.35)] via-[rgba(205,193,255,0.15)] to-transparent dark:from-[rgba(129,140,248,0.4)] dark:via-[rgba(167,139,250,0.2)] dark:to-transparent',
    orange:
      'from-[rgba(251,146,60,0.35)] via-[rgba(255,213,170,0.15)] to-transparent dark:from-[rgba(249,115,22,0.4)] dark:via-[rgba(251,146,60,0.2)] dark:to-transparent',
  },
  dark: {
    blue: 'from-[rgba(82,134,255,0.32)] via-[rgba(56,130,255,0.2)] to-transparent',
    green: 'from-[rgba(45,212,191,0.3)] via-[rgba(16,185,129,0.18)] to-transparent',
    purple: 'from-[rgba(167,139,250,0.32)] via-[rgba(129,140,248,0.2)] to-transparent',
    orange: 'from-[rgba(251,146,60,0.32)] via-[rgba(249,115,22,0.2)] to-transparent',
  },
};

const bulletMap: BulletMap = {
  light: {
    blue: 'bg-gradient-to-r from-neon-blue-500 to-sky-400 dark:from-neon-blue-400 dark:to-sky-500',
    green:
      'bg-gradient-to-r from-emerald-500 to-emerald-300 dark:from-emerald-400 dark:to-teal-400',
    purple:
      'bg-gradient-to-r from-neon-purple-500 to-indigo-400 dark:from-neon-purple-400 dark:to-indigo-500',
    orange: 'bg-gradient-to-r from-orange-500 to-amber-400 dark:from-orange-400 dark:to-amber-500',
  },
  dark: {
    blue: 'bg-gradient-to-r from-neon-blue-400 to-sky-500',
    green: 'bg-gradient-to-r from-emerald-400 to-teal-400',
    purple: 'bg-gradient-to-r from-neon-purple-400 to-indigo-500',
    orange: 'bg-gradient-to-r from-orange-400 to-amber-500',
  },
};

const highlightContainerMap: HighlightContainerMap = {
  light:
    'relative space-y-2 rounded-2xl border border-white/70 bg-white/70 p-4 text-sm text-neutral-600 shadow-inner dark:border-white/10 dark:bg-white/5 dark:text-neutral-300',
  dark:
    'relative flex flex-col gap-3',
};

const chipMap: ChipMap = {
  light:
    'rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm dark:bg-white/10 dark:text-neutral-200',
  dark:
    'rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-white/80 shadow-sm backdrop-blur-sm',
};

const descriptionMap: DescriptionMap = {
  light: 'text-sm text-neutral-600 dark:text-neutral-300',
  dark: 'text-sm text-white/78',
};

const titleMap: TitleMap = {
  light: 'text-xl font-semibold text-neutral-900 dark:text-white',
  dark: 'text-xl font-semibold text-white',
};

const indexBadgeMap: IndexBadgeMap = {
  blue: 'from-neon-blue-500 via-sky-500 to-indigo-500',
  green: 'from-emerald-500 via-teal-400 to-emerald-300',
  purple: 'from-neon-purple-500 via-purple-500 to-indigo-500',
  orange: 'from-orange-500 via-amber-500 to-orange-400',
};

const highlightAccentMap: HighlightAccentMap = {
  blue: 'bg-[linear-gradient(120deg,rgba(56,130,255,0.16),rgba(12,16,36,0.08))]',
  green: 'bg-[linear-gradient(120deg,rgba(16,185,129,0.16),rgba(10,20,18,0.08))]',
  purple: 'bg-[linear-gradient(120deg,rgba(167,139,250,0.16),rgba(24,20,44,0.08))]',
  orange: 'bg-[linear-gradient(120deg,rgba(249,115,22,0.18),rgba(32,18,12,0.08))]',
};

const highlightBorderMap: HighlightBorderMap = {
  blue: 'border-[rgba(56,130,255,0.45)]',
  green: 'border-[rgba(16,185,129,0.45)]',
  purple: 'border-[rgba(167,139,250,0.45)]',
  orange: 'border-[rgba(249,115,22,0.45)]',
};

const highlightTextMap: HighlightTextMap = {
  blue: 'text-[rgba(203,216,255,0.95)]',
  green: 'text-[rgba(188,246,225,0.95)]',
  purple: 'text-[rgba(226,215,255,0.95)]',
  orange: 'text-[rgba(255,223,202,0.95)]',
};

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
  variant = 'light',
  index,
  showIndexBadge = false,
  ...rest
}: FeatureCardProps): JSX.Element {
  const surfaceIntent = surfaceMap[variant][intent] ?? surfaceMap[variant].blue;
  const glowIntent = glowMap[variant][intent] ?? glowMap[variant].blue;
  const bulletAccent = bulletMap[variant][intent] ?? bulletMap[variant].blue;

  const displayIndex = showIndexBadge && typeof index === 'number'
    ? index + 1
    : undefined;

  return (
    <article
      {...rest}
      class={classSet(
        [
          'group relative flex h-full flex-col gap-6 overflow-hidden rounded-[26px] border p-7 transition-all duration-200 hover:-translate-y-1',
          variant === 'dark'
            ? 'shadow-[0_55px_200px_-140px_rgba(4,8,24,0.88)] hover:shadow-[0_85px_230px_-150px_rgba(14,22,52,0.9)]'
            : 'shadow-[0_30px_80px_-60px_rgba(62,45,171,0.45)] hover:shadow-[0_45px_120px_-60px_rgba(62,45,171,0.5)]',
          surfaceIntent,
        ],
        rest,
      )}
    >
      <div
        aria-hidden='true'
        class={classSet([
          'pointer-events-none absolute -top-28 right-[-25%] h-64 w-64 rounded-full bg-gradient-to-br opacity-65 blur-3xl transition-opacity duration-500 group-hover:opacity-95',
          glowIntent,
        ])}
      />
      <div class='relative flex items-start gap-5'>
        {displayIndex !== undefined
          ? (
            <span
              class={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-semibold text-white shadow-lg shadow-black/30 ${indexBadgeMap[intent]}`}
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
              class={variant === 'dark' ? 'shadow-lg shadow-black/35' : 'shadow-lg'}
            />
          )
          : null}
        <div class='space-y-3'>
          <h3 class={titleMap[variant]}>
            {title}
          </h3>
          <p class={descriptionMap[variant]}>{description}</p>
        </div>
      </div>

      {highlights?.length
        ? (
          variant === 'dark'
            ? (
              <div class={highlightContainerMap[variant]}>
                {highlights.map((item) => (
                  <div
                    key={item}
                    class={`inline-flex w-full flex-wrap items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-sm font-medium shadow-[0_16px_70px_-50px_rgba(18,26,62,0.85)] backdrop-blur-[1.5px] ${highlightAccentMap[intent]} ${highlightBorderMap[intent]}`}
                  >
                    <span class='text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-white/75'>Prompt</span>
                    <span class={`flex-1 text-left text-sm font-medium leading-snug sm:text-right ${highlightTextMap[intent]}`}>
                      &ldquo;{item}&rdquo;
                    </span>
                  </div>
                ))}
              </div>
            )
            : (
              <ul class={highlightContainerMap[variant]}>
                {highlights.map((item) => (
                  <li key={item} class='flex items-start gap-3'>
                    <span class={`mt-1 h-2 w-2 rounded-full ${bulletAccent}`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )
        )
        : null}

      {chips?.length
        ? (
          <div class='relative mt-auto'>
            <ChipList
              items={chips}
              class='flex flex-wrap gap-2'
              chipClass={chipMap[variant]}
            />
          </div>
        )
        : null}
    </article>
  );
}

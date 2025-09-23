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
      'border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(60,95,210,0.18),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(14,25,56,0.65),rgba(6,10,22,0.95))]',
    green:
      'border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(14,32,30,0.65),rgba(6,12,18,0.95))]',
    purple:
      'border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.2),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(30,24,68,0.68),rgba(11,13,28,0.95))]',
    orange:
      'border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.2),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(46,26,18,0.68),rgba(12,9,20,0.95))]',
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
    blue: 'from-[rgba(82,134,255,0.32)] via-[rgba(56,130,255,0.18)] to-transparent',
    green: 'from-[rgba(45,212,191,0.3)] via-[rgba(16,185,129,0.16)] to-transparent',
    purple: 'from-[rgba(167,139,250,0.32)] via-[rgba(129,140,248,0.18)] to-transparent',
    orange: 'from-[rgba(251,146,60,0.32)] via-[rgba(249,115,22,0.18)] to-transparent',
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
    'rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 shadow-sm backdrop-blur-sm',
};

const descriptionMap: DescriptionMap = {
  light: 'text-sm text-neutral-600 dark:text-neutral-300',
  dark: 'text-sm text-white/75',
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
  blue: 'from-[rgba(56,130,255,0.75)] via-[rgba(82,134,255,0.6)] to-[rgba(37,99,235,0.7)]',
  green: 'from-[rgba(16,185,129,0.75)] via-[rgba(5,150,105,0.6)] to-[rgba(4,120,87,0.68)]',
  purple: 'from-[rgba(167,139,250,0.78)] via-[rgba(129,140,248,0.62)] to-[rgba(99,102,241,0.75)]',
  orange: 'from-[rgba(249,115,22,0.78)] via-[rgba(251,146,60,0.62)] to-[rgba(234,88,12,0.72)]',
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
          'group relative flex h-full flex-col gap-6 overflow-hidden rounded-[28px] border p-7 transition-all duration-200 hover:-translate-y-1',
          variant === 'dark'
            ? 'border-white/6 shadow-[0_65px_200px_-140px_rgba(7,12,36,0.95)] hover:shadow-[0_90px_240px_-150px_rgba(16,28,72,0.95)]'
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
              class={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-semibold text-white shadow-lg shadow-black/40 ${indexBadgeMap[intent]}`}
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
              class={variant === 'dark' ? 'shadow-lg shadow-black/40' : 'shadow-lg'}
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
                    class={`inline-flex w-full flex-wrap items-center gap-3 rounded-[18px] border border-white/10 bg-gradient-to-r px-4 py-3 text-sm font-medium text-white shadow-[0_24px_90px_-70px_rgba(20,30,80,0.95)] ${highlightAccentMap[intent]}`}
                  >
                    <span class='text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-white/80'>
                      Prompt
                    </span>
                    <span class='flex-1 text-left text-sm font-medium leading-snug text-white/95'>
                      {item}
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

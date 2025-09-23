import { classSet, ComponentType, JSX } from '../../.deps.ts';
import {
  GradientIconBadge,
  type GradientIntent,
} from '../../atoms/marketing/GradientIconBadge.tsx';
import { ChipList } from '../../atoms/marketing/ChipList.tsx';

type FeatureCardVariant = 'light' | 'dark';

type SurfaceMap = Record<FeatureCardVariant, Record<GradientIntent, string>>;

type GlowMap = Record<FeatureCardVariant, Record<GradientIntent, string>>;

type PromptBackgroundMap = Record<GradientIntent, string>;

type PromptBorderMap = Record<GradientIntent, string>;

type PromptTextMap = Record<GradientIntent, string>;

type IndexBadgeMap = Record<GradientIntent, string>;

type DescriptionMap = Record<FeatureCardVariant, string>;

type TitleMap = Record<FeatureCardVariant, string>;

type ChipMap = Record<FeatureCardVariant, string>;

type ShadowMap = Record<FeatureCardVariant, string>;

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
      'border-[rgba(98,148,255,0.38)] bg-[radial-gradient(circle_at_top_left,rgba(70,110,255,0.16),transparent_55%),linear-gradient(150deg,rgba(19,27,56,0.95),rgba(10,15,36,0.9))]',
    green:
      'border-[rgba(38,205,170,0.36)] bg-[radial-gradient(circle_at_top_left,rgba(34,197,142,0.18),transparent_55%),linear-gradient(150deg,rgba(14,32,28,0.94),rgba(8,14,24,0.9))]',
    purple:
      'border-[rgba(177,156,255,0.36)] bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.2),transparent_55%),linear-gradient(150deg,rgba(30,24,68,0.95),rgba(12,14,30,0.92))]',
    orange:
      'border-[rgba(255,168,112,0.36)] bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_55%),linear-gradient(150deg,rgba(44,24,18,0.94),rgba(18,12,22,0.9))]',
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
    blue: 'from-[rgba(89,140,255,0.28)] via-[rgba(56,130,255,0.18)] to-transparent',
    green: 'from-[rgba(45,212,191,0.26)] via-[rgba(16,185,129,0.16)] to-transparent',
    purple: 'from-[rgba(177,156,255,0.28)] via-[rgba(129,140,248,0.18)] to-transparent',
    orange: 'from-[rgba(255,168,112,0.28)] via-[rgba(249,115,22,0.18)] to-transparent',
  },
};

const promptBackgroundMap: PromptBackgroundMap = {
  blue: 'bg-[radial-gradient(circle_at_top_left,rgba(80,130,255,0.32),rgba(14,18,40,0.18))]',
  green: 'bg-[radial-gradient(circle_at_top_left,rgba(34,197,142,0.32),rgba(12,22,20,0.18))]',
  purple: 'bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.34),rgba(24,22,42,0.18))]',
  orange: 'bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.34),rgba(32,20,16,0.18))]',
};

const promptBorderMap: PromptBorderMap = {
  blue: 'border-[rgba(98,148,255,0.55)]',
  green: 'border-[rgba(45,212,191,0.55)]',
  purple: 'border-[rgba(177,156,255,0.55)]',
  orange: 'border-[rgba(255,168,112,0.55)]',
};

const promptTextMap: PromptTextMap = {
  blue: 'text-[rgba(220,232,255,0.98)]',
  green: 'text-[rgba(210,246,235,0.96)]',
  purple: 'text-[rgba(236,225,255,0.96)]',
  orange: 'text-[rgba(255,232,214,0.96)]',
};

const indexBadgeMap: IndexBadgeMap = {
  blue: 'from-neon-blue-500 via-sky-500 to-indigo-500',
  green: 'from-emerald-500 via-teal-400 to-emerald-300',
  purple: 'from-neon-purple-500 via-purple-500 to-indigo-500',
  orange: 'from-orange-500 via-amber-500 to-orange-400',
};

const descriptionMap: DescriptionMap = {
  light: 'text-sm text-neutral-600 dark:text-neutral-300',
  dark: 'text-sm text-white/78',
};

const titleMap: TitleMap = {
  light: 'text-xl font-semibold text-neutral-900 dark:text-white',
  dark: 'text-xl font-semibold text-white',
};

const chipMap: ChipMap = {
  light:
    'rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm dark:bg-white/10 dark:text-neutral-200',
  dark:
    'rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 shadow-sm backdrop-blur-sm',
};

const shadowMap: ShadowMap = {
  light: 'shadow-[0_30px_80px_-60px_rgba(62,45,171,0.45)] hover:shadow-[0_45px_120px_-60px_rgba(62,45,171,0.5)]',
  dark: 'shadow-[0_65px_200px_-140px_rgba(4,8,20,0.85)] hover:shadow-[0_90px_240px_-150px_rgba(14,22,56,0.9)]',
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
  const promptBackground = promptBackgroundMap[intent] ?? promptBackgroundMap.blue;
  const promptBorder = promptBorderMap[intent] ?? promptBorderMap.blue;
  const promptText = promptTextMap[intent] ?? promptTextMap.blue;
  const shadowClass = shadowMap[variant];

  const displayIndex = showIndexBadge && typeof index === 'number'
    ? index + 1
    : undefined;

  return (
    <article
      {...rest}
      class={classSet([
        'group relative flex h-full flex-col gap-6 overflow-hidden rounded-[26px] border px-8 py-8 transition-all duration-200 hover:-translate-y-1',
        shadowClass,
        surfaceIntent,
      ], rest)}
    >
      <div
        aria-hidden='true'
        class={classSet([
          'pointer-events-none absolute -top-28 right-[-25%] h-64 w-64 rounded-full bg-gradient-to-br opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-90',
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
          <div class='relative flex flex-col gap-2'>
            <span class='text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-white/70'>Prompt</span>
            <span
              class={classSet([
                'inline-flex items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-sm font-medium shadow-[0_18px_70px_-55px_rgba(12,18,40,0.85)] backdrop-blur-[1.5px]',
                promptBackground,
                promptBorder,
                promptText,
              ])}
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
              chipClass={chipMap[variant]}
            />
          </div>
        )
        : null}
    </article>
  );
}

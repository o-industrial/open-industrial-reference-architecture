import { classSet, JSX } from '../../.deps.ts';
import {
  SectionSurface,
  type SectionSurfaceProps,
  type SectionSurfaceTone,
} from '../../atoms/marketing/SectionSurface.tsx';
import {
  SectionHeader,
  type SectionHeaderProps,
} from '../../molecules/marketing/SectionHeader.tsx';
import {
  FeatureCard,
  type FeatureCardProps,
} from '../../molecules/marketing/FeatureCard.tsx';

export type ValueGridSectionVariant = 'light' | 'dark';

export type ValueGridSectionProps = {
  header: SectionHeaderProps;
  items: FeatureCardProps[];
  columns?: 1 | 2 | 3;
  tone?: SectionSurfaceTone;
  variant?: ValueGridSectionVariant;
  cardVariant?: FeatureCardProps['variant'];
  showIndexBadge?: boolean;
  disableAccents?: boolean;
} & Omit<SectionSurfaceProps, 'children' | 'tone'>;

export function ValueGridSection({
  header,
  items,
  columns = 3,
  tone,
  variant = 'light',
  cardVariant,
  showIndexBadge = false,
  disableAccents = false,
  class: className,
  ...rest
}: ValueGridSectionProps): JSX.Element {
  const resolvedTone = tone ?? (variant === 'dark' ? 'emphasis' : 'default');
  const grid = columns === 1
    ? 'grid-cols-1'
    : columns === 2
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  const overlayClass = variant === 'dark'
    ? 'absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_rgba(10,12,24,0)),radial-gradient(circle_at_bottom,_rgba(34,211,238,0.12),_rgba(10,12,24,0))]'
    : 'absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(141,121,255,0.12),_rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_rgba(8,13,35,0)_72%)]';

  const leftGlowClass = variant === 'dark'
    ? 'absolute -left-24 bottom-12 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(34,211,238,0.18),_rgba(7,10,22,0)_72%)] blur-[140px]'
    : 'absolute -left-24 bottom-12 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(148,163,184,0.2),_rgba(255,255,255,0)_70%)] blur-[120px] dark:bg-[radial-gradient(circle,_rgba(129,140,248,0.28),_rgba(255,255,255,0)_72%)]';

  const rightGlowClass = variant === 'dark'
    ? 'absolute -right-16 top-24 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(236,72,153,0.16),_rgba(8,12,24,0)_70%)] blur-[140px]'
    : 'absolute -right-16 top-24 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(148,163,184,0.18),_rgba(255,255,255,0)_70%)] blur-[120px] dark:bg-[radial-gradient(circle,_rgba(34,211,238,0.28),_rgba(255,255,255,0)_72%)]';

  const resolvedCardVariant = cardVariant ?? (variant === 'dark' ? 'dark' : 'light');
  const showAccents = !disableAccents;

  return (
    <SectionSurface
      tone={resolvedTone}
      {...rest}
      class={classSet(['relative overflow-hidden'], { class: className })}
    >
      {showAccents ? (
        <div
          aria-hidden='true'
          class='pointer-events-none absolute inset-0'
        >
          <div class={overlayClass} />
          <div class={leftGlowClass} />
          <div class={rightGlowClass} />
        </div>
      ) : null}
      <div class='space-y-14'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <div class={`grid gap-8 ${grid}`}>
          {items.map((item, index) => (
            <FeatureCard
              key={`feature-${index}`}
              {...item}
              variant={resolvedCardVariant}
              index={index}
              showIndexBadge={showIndexBadge}
            />
          ))}
        </div>
      </div>
    </SectionSurface>
  );
}

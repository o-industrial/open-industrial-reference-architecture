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
import { FeatureCard, type FeatureCardProps } from '../../molecules/marketing/FeatureCard.tsx';

export type ValueGridSectionProps = {
  header: SectionHeaderProps;
  items: FeatureCardProps[];
  columns?: 1 | 2 | 3;
  tone?: SectionSurfaceTone;
} & Omit<SectionSurfaceProps, 'children' | 'tone'>;

export function ValueGridSection({
  header,
  items,
  columns = 3,
  tone = 'default',
  class: className,
  ...rest
}: ValueGridSectionProps): JSX.Element {
  const grid = columns === 1
    ? 'grid-cols-1'
    : columns === 2
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <SectionSurface
      tone={tone}
      {...rest}
      class={classSet(['relative overflow-hidden'], { class: className })}
    >
      <div
        aria-hidden='true'
        class='pointer-events-none absolute inset-0'
      >
        <div class='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(141,121,255,0.12),_rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_rgba(8,13,35,0)_72%)]' />
        <div class='absolute -left-24 bottom-12 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(96,165,250,0.16),_rgba(255,255,255,0)_68%)] blur-[120px] dark:bg-[radial-gradient(circle,_rgba(96,165,250,0.28),_rgba(255,255,255,0)_72%)]' />
        <div class='absolute -right-16 top-24 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(52,211,153,0.16),_rgba(255,255,255,0)_68%)] blur-[120px] dark:bg-[radial-gradient(circle,_rgba(45,212,191,0.28),_rgba(255,255,255,0)_72%)]' />
      </div>
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <div class={`grid gap-6 ${grid}`}>
          {items.map((item, index) => <FeatureCard key={`feature-${index}`} {...item} />)}
        </div>
      </div>
    </SectionSurface>
  );
}

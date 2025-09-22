import { classSet, JSX } from '../../.deps.ts';
import { SectionSurface, type SectionSurfaceTone } from '../../atoms/marketing/SectionSurface.tsx';
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
} & JSX.HTMLAttributes<HTMLElement>;

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
      class={classSet([], { class: className })}
    >
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <div class={`grid gap-6 ${grid}`}>
          {items.map((item, index) => <FeatureCard key={`feature-${index}`} {...item} />)}
        </div>
      </div>
    </SectionSurface>
  );
}

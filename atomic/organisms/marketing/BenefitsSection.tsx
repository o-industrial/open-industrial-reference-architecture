import { classSet, JSX } from '../../.deps.ts';
import { SectionSurface } from '../../atoms/marketing/SectionSurface.tsx';
import {
  SectionHeader,
  type SectionHeaderProps,
} from '../../molecules/marketing/SectionHeader.tsx';
import { ChecklistGroup, type ChecklistItem } from '../../molecules/marketing/ChecklistGroup.tsx';

export type BenefitsSectionProps = {
  header: SectionHeaderProps;
  items: ChecklistItem[];
  columns?: 1 | 2 | 3;
} & JSX.HTMLAttributes<HTMLElement>;

export function BenefitsSection({
  header,
  items,
  columns = 3,
  class: className,
  ...rest
}: BenefitsSectionProps): JSX.Element {
  return (
    <SectionSurface
      tone='default'
      {...rest}
      class={classSet([], { class: className })}
    >
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <ChecklistGroup items={items} columns={columns} />
      </div>
    </SectionSurface>
  );
}

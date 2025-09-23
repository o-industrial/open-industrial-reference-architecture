import { classSet, JSX } from '../../.deps.ts';
import {
  SectionSurface,
  type SectionSurfaceProps,
} from '../../atoms/marketing/SectionSurface.tsx';
import {
  SectionHeader,
  type SectionHeaderProps,
} from '../../molecules/marketing/SectionHeader.tsx';
import { ChecklistGroup, type ChecklistItem } from '../../molecules/marketing/ChecklistGroup.tsx';

export type BenefitsSectionProps = {
  header: SectionHeaderProps;
  items: ChecklistItem[];
  columns?: 1 | 2 | 3;
} & Omit<SectionSurfaceProps, 'children' | 'tone'>;

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
      class={classSet(['relative overflow-hidden'], { class: className })}
    >
      <div
        aria-hidden='true'
        class='pointer-events-none absolute inset-0'
      >
        <div class='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.12),_rgba(255,255,255,0)_72%)] opacity-80 dark:bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.2),_rgba(8,13,35,0)_75%)]' />
        <div class='absolute left-1/2 top-1/2 h-64 w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_120deg_at_center,_rgba(167,139,250,0.15),_rgba(96,165,250,0.08),_rgba(52,211,153,0.12),_rgba(255,255,255,0))] blur-[120px] dark:bg-[conic-gradient(from_120deg_at_center,_rgba(129,140,248,0.22),_rgba(56,189,248,0.12),_rgba(16,185,129,0.18),_rgba(8,13,35,0))]' />
      </div>
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <ChecklistGroup items={items} columns={columns} />
      </div>
    </SectionSurface>
  );
}

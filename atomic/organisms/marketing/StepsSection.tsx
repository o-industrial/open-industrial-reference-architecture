import { classSet, JSX } from '../../.deps.ts';
import {
  SectionSurface,
  type SectionSurfaceProps,
} from '../../atoms/marketing/SectionSurface.tsx';
import {
  SectionHeader,
  type SectionHeaderProps,
} from '../../molecules/marketing/SectionHeader.tsx';
import {
  ChecklistGroup,
  type ChecklistGroupProps,
} from '../../molecules/marketing/ChecklistGroup.tsx';

export type StepsSectionProps = {
  header: SectionHeaderProps;
  steps: ChecklistGroupProps['items'];
  columns?: ChecklistGroupProps['columns'];
} & Omit<SectionSurfaceProps, 'children' | 'tone'>;

export function StepsSection({
  header,
  steps,
  columns = 3,
  class: className,
  ...rest
}: StepsSectionProps): JSX.Element {
  return (
    <SectionSurface
      tone='muted'
      {...rest}
      class={classSet(['relative overflow-hidden'], { class: className })}
    >
      <div
        aria-hidden='true'
        class='pointer-events-none absolute inset-0'
      >
        <div class='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.14),_rgba(255,255,255,0)_75%)] opacity-80 dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.2),_rgba(8,13,35,0)_78%)]' />
        <div class='absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10' />
      </div>
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <ChecklistGroup items={steps} columns={columns} />
      </div>
    </SectionSurface>
  );
}

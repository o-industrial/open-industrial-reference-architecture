import { classSet, JSX } from '../../.deps.ts';
import { SectionSurface } from '../../atoms/marketing/SectionSurface.tsx';
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
} & JSX.HTMLAttributes<HTMLElement>;

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
      class={classSet([], { class: className })}
    >
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <ChecklistGroup items={steps} columns={columns} />
      </div>
    </SectionSurface>
  );
}

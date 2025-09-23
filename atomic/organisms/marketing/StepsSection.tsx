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
  variant?: 'light' | 'dark';
} & Omit<SectionSurfaceProps, 'children'>;

export function StepsSection({
  header,
  steps,
  columns = 3,
  variant = 'light',
  class: className,
  tone = 'muted',
  ...rest
}: StepsSectionProps): JSX.Element {
  const spotlightClass = variant === 'dark'
    ? 'bg-[radial-gradient(circle_at_top,_rgba(118,103,255,0.24),_rgba(5,7,18,0)_78%)] opacity-90'
    : 'bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.14),_rgba(255,255,255,0)_75%)] opacity-80 dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.2),_rgba(8,13,35,0)_78%)]';

  const dividerClass = variant === 'dark'
    ? 'bg-gradient-to-r from-transparent via-white/18 to-transparent'
    : 'bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10';

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
        <div class={`absolute inset-0 ${spotlightClass}`} />
        <div class={`absolute inset-x-0 top-1/2 h-px -translate-y-1/2 ${dividerClass}`} />
      </div>
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <ChecklistGroup
          items={steps}
          columns={columns}
          variant={variant}
        />
      </div>
    </SectionSurface>
  );
}

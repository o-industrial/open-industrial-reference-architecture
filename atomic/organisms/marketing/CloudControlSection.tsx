import { classSet, JSX } from '../../.deps.ts';
import { SectionSurface } from '../../atoms/marketing/SectionSurface.tsx';
import {
  SectionHeader,
  type SectionHeaderProps,
} from '../../molecules/marketing/SectionHeader.tsx';

export type CloudControlItem = {
  title: JSX.Element | string;
  description?: JSX.Element | string;
};

export type CloudControlSectionProps = {
  header: SectionHeaderProps;
  items: CloudControlItem[];
} & JSX.HTMLAttributes<HTMLElement>;

export function CloudControlSection({
  header,
  items,
  class: className,
  ...rest
}: CloudControlSectionProps): JSX.Element {
  return (
    <SectionSurface
      tone='default'
      {...rest}
      class={classSet([], { class: className })}
    >
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <div class='grid gap-6 sm:grid-cols-2'>
          {items.map((item, index) => (
            <div
              key={`cloud-control-${index}`}
              class='flex items-start gap-4 rounded-2xl border border-neutral-200/70 bg-white/80 p-4 dark:border-white/10 dark:bg-neutral-950/70'
            >
              <span class='mt-1 block h-2 w-2 rounded-full bg-emerald-400' />
              <div>
                <h4 class='text-base font-semibold text-neutral-900 dark:text-white'>
                  {item.title}
                </h4>
                {item.description
                  ? (
                    <p class='mt-1 text-sm text-neutral-600 dark:text-neutral-400'>
                      {item.description}
                    </p>
                  )
                  : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionSurface>
  );
}

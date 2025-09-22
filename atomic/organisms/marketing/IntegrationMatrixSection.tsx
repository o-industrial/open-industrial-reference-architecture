import { classSet, JSX } from '../../.deps.ts';
import { SectionSurface } from '../../atoms/marketing/SectionSurface.tsx';
import {
  SectionHeader,
  type SectionHeaderProps,
} from '../../molecules/marketing/SectionHeader.tsx';
import { ChipList } from '../../atoms/marketing/ChipList.tsx';

export type IntegrationColumn = {
  title: string;
  items: string[];
};

export type IntegrationMatrixSectionProps = {
  header: SectionHeaderProps;
  columns: IntegrationColumn[];
} & JSX.HTMLAttributes<HTMLElement>;

export function IntegrationMatrixSection({
  header,
  columns,
  class: className,
  ...rest
}: IntegrationMatrixSectionProps): JSX.Element {
  return (
    <SectionSurface
      tone='default'
      {...rest}
      class={classSet([], { class: className })}
    >
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <div class='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {columns.map((column, index) => (
            <div
              key={`integration-column-${index}`}
              class='flex flex-col gap-4 rounded-2xl border border-neutral-200/70 bg-white/80 p-6 text-left shadow-sm dark:border-white/10 dark:bg-neutral-950/70'
            >
              <h3 class='text-lg font-semibold text-neutral-900 dark:text-white'>{column.title}</h3>
              <ChipList
                items={column.items}
                chipClass='bg-neutral-200/60 dark:bg-neutral-800/80'
              />
            </div>
          ))}
        </div>
      </div>
    </SectionSurface>
  );
}

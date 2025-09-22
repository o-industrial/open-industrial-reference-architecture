import { classSet, JSX } from '../../.deps.ts';
import { SectionSurface } from '../../atoms/marketing/SectionSurface.tsx';
import {
  SectionHeader,
  type SectionHeaderProps,
} from '../../molecules/marketing/SectionHeader.tsx';
import { ChipList } from '../../atoms/marketing/ChipList.tsx';

const columnPalettes = [
  {
    surface:
      'border-neon-purple-500/40 bg-gradient-to-br from-[#f4efff] via-[#ece4ff] to-[#f5f2ff] dark:border-neon-purple-400/25 dark:from-[#18143a] dark:via-[#241c55] dark:to-[#101331]',
    chip: 'bg-neon-purple-500/15 text-neutral-800 dark:bg-neon-purple-500/20 dark:text-white',
  },
  {
    surface:
      'border-neon-blue-500/40 bg-gradient-to-br from-[#edf4ff] via-[#e7f0ff] to-[#f0f7ff] dark:border-neon-blue-400/25 dark:from-[#10182f] dark:via-[#182349] dark:to-[#0b1634]',
    chip: 'bg-neon-blue-500/15 text-neutral-800 dark:bg-neon-blue-500/20 dark:text-white',
  },
  {
    surface:
      'border-orange-500/40 bg-gradient-to-br from-[#fff2e8] via-[#ffece0] to-[#fff8ef] dark:border-orange-400/25 dark:from-[#2a1707] dark:via-[#3a1f0b] dark:to-[#1f1309]',
    chip: 'bg-orange-500/15 text-neutral-800 dark:bg-orange-500/25 dark:text-white',
  },
  {
    surface:
      'border-emerald-500/40 bg-gradient-to-br from-[#e9fbf4] via-[#e3f7ef] to-[#f1fdf8] dark:border-emerald-400/25 dark:from-[#0c2a1d] dark:via-[#153b29] dark:to-[#0a2016]',
    chip: 'bg-emerald-500/15 text-neutral-800 dark:bg-emerald-500/25 dark:text-white',
  },
];

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
          {columns.map((column, index) => {
            const palette = columnPalettes[index % columnPalettes.length];

            return (
              <div
                key={`integration-column-${index}`}
                class={classSet([
                  'flex flex-col gap-4 rounded-2xl border p-6 text-left shadow-sm backdrop-blur-sm',
                  palette.surface,
                ])}
              >
                <h3 class='text-lg font-semibold text-neutral-900 dark:text-white'>
                  {column.title}
                </h3>
                <ChipList
                  items={column.items}
                  chipClass={`rounded-full px-3 py-1 text-xs font-medium ${palette.chip}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </SectionSurface>
  );
}

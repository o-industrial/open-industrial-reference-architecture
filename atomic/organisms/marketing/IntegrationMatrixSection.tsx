import { classSet, JSX } from '../../.deps.ts';
import {
  SectionSurface,
  type SectionSurfaceProps,
} from '../../atoms/marketing/SectionSurface.tsx';
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
} & Omit<SectionSurfaceProps, 'children' | 'tone'>;

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
      class={classSet(['relative overflow-hidden'], { class: className })}
    >
      <div
        aria-hidden='true'
        class='pointer-events-none absolute inset-0'
      >
        <div class='absolute left-1/2 top-10 h-64 w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(96,165,250,0.22),_rgba(255,255,255,0)_72%)] blur-3xl dark:bg-[radial-gradient(circle,_rgba(96,165,250,0.32),_rgba(255,255,255,0)_70%)]' />
        <div class='absolute -left-24 bottom-6 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(167,139,250,0.22),_rgba(255,255,255,0)_70%)] blur-[120px] dark:bg-[radial-gradient(circle,_rgba(167,139,250,0.34),_rgba(255,255,255,0)_72%)]' />
        <div class='absolute -right-16 top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(52,211,153,0.22),_rgba(255,255,255,0)_70%)] blur-[120px] dark:bg-[radial-gradient(circle,_rgba(52,211,153,0.32),_rgba(255,255,255,0)_72%)]' />
      </div>
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <div class='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {columns.map((column, index) => {
            const palette = columnPalettes[index % columnPalettes.length];

            return (
              <div
                key={`integration-column-${index}`}
                class={classSet([
                  'group relative flex flex-col gap-5 overflow-hidden rounded-3xl border p-6 text-left shadow-[0_25px_80px_-60px_rgba(62,45,171,0.4)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_40px_120px_-70px_rgba(62,45,171,0.5)]',
                  palette.surface,
                ])}
              >
                <div
                  aria-hidden='true'
                  class='pointer-events-none absolute -top-20 right-[-35%] h-52 w-52 rounded-full bg-white/25 blur-3xl opacity-70 transition-opacity duration-500 group-hover:opacity-100 dark:bg-white/15'
                />
                <h3 class='text-lg font-semibold text-neutral-900 dark:text-white'>
                  {column.title}
                </h3>
                <div class='flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500'>
                  <span class='h-px flex-1 bg-gradient-to-r from-transparent via-neutral-300/60 to-transparent dark:via-white/10' />
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span class='h-px flex-1 bg-gradient-to-r from-transparent via-neutral-300/60 to-transparent dark:via-white/10' />
                </div>
                <ChipList
                  items={column.items}
                  chipClass={`rounded-full px-3 py-1 text-xs font-medium shadow-sm transition-colors duration-150 ${palette.chip}`}
                  class='flex flex-wrap gap-2'
                />
              </div>
            );
          })}
        </div>
      </div>
    </SectionSurface>
  );
}

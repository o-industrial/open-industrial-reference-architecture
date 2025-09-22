import { classSet, JSX } from '../../.deps.ts';
import { SectionSurface } from '../../atoms/marketing/SectionSurface.tsx';
import {
  SectionHeader,
  type SectionHeaderProps,
} from '../../molecules/marketing/SectionHeader.tsx';

export type FlowNode = {
  title: string;
  subtitle?: string;
  description?: string;
};

export type FlowDiagramContent = {
  inputs: FlowNode[];
  hub: FlowNode;
  outputs: FlowNode[];
};

export type FlowDiagramSectionProps = {
  header: SectionHeaderProps;
  content: FlowDiagramContent;
} & Omit<JSX.HTMLAttributes<HTMLElement>, 'content'>;

const inputPalette = [
  'border-neon-purple-500/40 bg-gradient-to-br from-[#f4efff] via-[#ede6ff] to-[#f7f4ff] dark:border-neon-purple-400/25 dark:from-[#1a163c] dark:via-[#241c55] dark:to-[#121335]',
  'border-neon-blue-500/40 bg-gradient-to-br from-[#edf4ff] via-[#e8f1ff] to-[#f1f8ff] dark:border-neon-blue-400/25 dark:from-[#111a32] dark:via-[#1a2648] dark:to-[#0c1633]',
];

const outputPalette = [
  'border-emerald-500/40 bg-gradient-to-br from-[#e9fbf4] via-[#e3f7ef] to-[#f2fdf9] dark:border-emerald-400/25 dark:from-[#0d2b1e] dark:via-[#153b2a] dark:to-[#0b2015]',
  'border-orange-500/40 bg-gradient-to-br from-[#fff2e8] via-[#ffeee0] to-[#fff8ee] dark:border-orange-400/25 dark:from-[#2c1807] dark:via-[#3b210b] dark:to-[#1f1309]',
];

function renderNode(node: FlowNode, index: number, prefix: string): JSX.Element {
  const palette = prefix === 'input'
    ? inputPalette[index % inputPalette.length]
    : outputPalette[index % outputPalette.length];

  return (
    <div
      key={`${prefix}-${index}-${node.title}`}
      class={classSet([
        'rounded-2xl border p-4 text-center shadow-sm backdrop-blur-sm',
        palette,
      ])}
    >
      <h4 class='text-sm font-semibold text-neutral-900 dark:text-white'>{node.title}</h4>
      {node.subtitle
        ? <div class='text-xs text-neutral-600 dark:text-neutral-300'>{node.subtitle}</div>
        : null}
      {node.description
        ? <p class='mt-2 text-xs text-neutral-600 dark:text-neutral-300'>{node.description}</p>
        : null}
    </div>
  );
}

export function FlowDiagramSection({
  header,
  content,
  class: className,
  ...rest
}: FlowDiagramSectionProps): JSX.Element {
  return (
    <SectionSurface
      tone='muted'
      {...rest}
      class={classSet([], { class: className })}
    >
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <div class='grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-start'>
          <div class='space-y-4'>
            {content.inputs.map((node, index) => renderNode(node, index, 'input'))}
          </div>

          <div class='flex flex-col items-center gap-4'>
            <div class='h-12 w-px bg-gradient-to-b from-neon-purple-400/40 via-transparent to-neon-blue-400/40 lg:h-full lg:w-1 lg:bg-gradient-to-r' />
            <div class='relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-[#221b63] via-[#3d2f9e] to-[#1f5db8] px-6 py-8 text-center text-white shadow-2xl backdrop-blur-md dark:border-white/20 dark:from-[#1a1452] dark:via-[#2d21a0] dark:to-[#124a94]'>
              <div
                aria-hidden='true'
                class='pointer-events-none absolute -top-10 right-1/2 h-40 w-40 translate-x-1/2 rounded-full bg-white/15 blur-3xl'
              />
              <div class='text-sm uppercase tracking-[0.35em] text-white/60'>Hub</div>
              <h3 class='mt-3 text-xl font-semibold'>{content.hub.title}</h3>
              {content.hub.description
                ? <p class='mt-2 text-sm text-white/80'>{content.hub.description}</p>
                : null}
            </div>
            <div class='h-12 w-px bg-gradient-to-b from-neon-blue-400/40 via-transparent to-emerald-400/40 lg:h-full lg:w-1 lg:bg-gradient-to-r' />
          </div>

          <div class='space-y-4'>
            {content.outputs.map((node, index) => renderNode(node, index, 'output'))}
          </div>
        </div>
      </div>
    </SectionSurface>
  );
}

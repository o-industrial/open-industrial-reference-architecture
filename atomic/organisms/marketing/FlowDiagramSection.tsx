import { classSet, JSX } from '../../.deps.ts';
import {
  SectionSurface,
  type SectionSurfaceProps,
} from '../../atoms/marketing/SectionSurface.tsx';
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
} & Omit<SectionSurfaceProps, 'children' | 'tone'>;

const inputPalette = [
  'border-neon-purple-500/40 bg-gradient-to-br from-neon-purple-50 via-neon-purple-100 to-neon-purple-50 dark:border-neon-purple-400/25 dark:from-[rgba(26,22,60,1)] dark:via-[rgba(36,28,85,1)] dark:to-[rgba(18,19,53,1)]',
  'border-neon-blue-500/40 bg-gradient-to-br from-neon-blue-50 via-neon-blue-100 to-neon-blue-50 dark:border-neon-blue-400/25 dark:from-[rgba(17,26,50,1)] dark:via-[rgba(26,38,72,1)] dark:to-[rgba(12,22,51,1)]',
];

const outputPalette = [
  'border-neon-green-500/40 bg-gradient-to-br from-neon-green-50 via-neon-green-100 to-neon-green-50 dark:border-neon-green-400/25 dark:from-[rgba(13,43,31,1)] dark:via-[rgba(21,59,41,1)] dark:to-[rgba(11,32,22,1)]',
  'border-neon-orange-500/40 bg-gradient-to-br from-neon-orange-50 via-neon-yellow-50 to-neon-orange-50 dark:border-neon-orange-400/25 dark:from-[rgba(44,24,7,1)] dark:via-[rgba(59,31,11,1)] dark:to-[rgba(31,19,9,1)]',
];

function renderNode(node: FlowNode, index: number, prefix: string): JSX.Element {
  const palette = prefix === 'input'
    ? inputPalette[index % inputPalette.length]
    : outputPalette[index % outputPalette.length];

  return (
    <div
      key={`${prefix}-${index}-${node.title}`}
      class={classSet([
        'space-y-2 rounded-2xl border p-4 text-center shadow-[0_18px_60px_-50px_rgba(62,45,171,0.45)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_28px_90px_-60px_rgba(62,45,171,0.5)]',
        palette,
      ])}
    >
      <div class='flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400'>
        <span>{prefix === 'input' ? 'Input' : 'Output'}</span>
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <h4 class='text-sm font-semibold text-neutral-100 dark:text-white'>{node.title}</h4>
      {node.subtitle
        ? <div class='text-xs text-neutral-300 dark:text-neutral-300'>{node.subtitle}</div>
        : null}
      {node.description
        ? <p class='mt-2 text-xs text-neutral-300 dark:text-neutral-300'>{node.description}</p>
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
      class={classSet(['relative overflow-hidden'], { class: className })}
    >
      <div
        aria-hidden='true'
        class='pointer-events-none absolute inset-0'
      >
        <div class='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.12),_rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_rgba(8,13,35,0)_72%)]' />
        <div class='absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.2)_0%,_rgba(255,255,255,0)_35%)] opacity-60 dark:bg-[linear-gradient(120deg,_rgba(255,255,255,0.07)_0%,_rgba(255,255,255,0)_35%)]' />
      </div>
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <div class='grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-start'>
          <div class='relative space-y-4 lg:pr-8'>
            <div class='pointer-events-none absolute inset-y-8 -right-3 hidden w-px bg-gradient-to-b from-transparent via-white/60 to-transparent dark:via-white/10 lg:block' />
            {content.inputs.map((node, index) => renderNode(node, index, 'input'))}
          </div>

          <div class='flex flex-col items-center gap-4'>
            <div class='h-12 w-px bg-gradient-to-b from-neon-purple-400/40 via-transparent to-neon-blue-400/40 lg:h-full lg:w-px lg:bg-gradient-to-r' />
            <div class='relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-slate-950 via-[#181d34] to-slate-900 px-6 py-8 text-center text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.65)] backdrop-blur-xl dark:border-white/20 dark:from-[rgba(26,20,82,1)] dark:via-[rgba(45,33,160,1)] dark:to-[rgba(18,74,148,1)]'>
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
            <div class='h-12 w-px bg-gradient-to-b from-neon-blue-400/40 via-transparent to-neon-green-400/40 lg:h-full lg:w-px lg:bg-gradient-to-r' />
          </div>

          <div class='relative space-y-4 lg:pl-8'>
            <div class='pointer-events-none absolute inset-y-8 -left-3 hidden w-px bg-gradient-to-b from-transparent via-white/60 to-transparent dark:via-white/10 lg:block' />
            {content.outputs.map((node, index) => renderNode(node, index, 'output'))}
          </div>
        </div>
      </div>
    </SectionSurface>
  );
}

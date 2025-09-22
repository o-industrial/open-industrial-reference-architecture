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
} & JSX.HTMLAttributes<HTMLElement>;

function renderNode(node: FlowNode, index: number, prefix: string): JSX.Element {
  return (
    <div
      key={`${prefix}-${index}-${node.title}`}
      class='rounded-2xl border border-neutral-200/70 bg-white/80 p-4 text-center shadow-sm dark:border-white/10 dark:bg-neutral-950/70'
    >
      <h4 class='text-sm font-semibold text-neutral-900 dark:text-white'>{node.title}</h4>
      {node.subtitle
        ? <div class='text-xs text-neutral-500 dark:text-neutral-400'>{node.subtitle}</div>
        : null}
      {node.description
        ? <p class='mt-2 text-xs text-neutral-500 dark:text-neutral-400'>{node.description}</p>
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
            <div class='h-12 w-px bg-gradient-to-b from-neutral-400 to-transparent lg:h-full lg:w-1 lg:bg-gradient-to-r' />
            <div class='rounded-3xl border border-neutral-200/80 bg-neutral-900/90 px-6 py-8 text-center text-white shadow-lg dark:border-white/10 dark:bg-neutral-900'>
              <div class='text-sm uppercase tracking-[0.35em] text-neutral-400'>Hub</div>
              <h3 class='mt-3 text-xl font-semibold'>{content.hub.title}</h3>
              {content.hub.description
                ? <p class='mt-2 text-sm text-neutral-300'>{content.hub.description}</p>
                : null}
            </div>
            <div class='h-12 w-px bg-gradient-to-b from-transparent to-neutral-400 lg:h-full lg:w-1 lg:bg-gradient-to-r' />
          </div>

          <div class='space-y-4'>
            {content.outputs.map((node, index) => renderNode(node, index, 'output'))}
          </div>
        </div>
      </div>
    </SectionSurface>
  );
}

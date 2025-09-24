import { classSet, JSX } from '../../.deps.ts';
import { SectionSurface, type SectionSurfaceProps } from '../../atoms/marketing/SectionSurface.tsx';
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
} & Omit<SectionSurfaceProps, 'children' | 'tone' | 'content'>;

const inputDecor = [
  {
    card:
      'border-white/10 bg-[radial-gradient(circle,_rgba(129,140,248,0.18),rgba(14,18,38,0.9)),linear-gradient(145deg,rgba(13,16,32,0.92),rgba(9,12,24,0.92))]',
    glow: 'from-[rgba(129,140,248,0.35)] via-[rgba(96,165,250,0.22)] to-transparent',
    icon: 'from-neon-purple-500 via-neon-blue-500 to-neon-cyan-400',
  },
  {
    card:
      'border-white/10 bg-[radial-gradient(circle,_rgba(34,211,238,0.16),rgba(10,16,32,0.92)),linear-gradient(145deg,rgba(9,14,28,0.92),rgba(6,10,22,0.92))]',
    glow: 'from-[rgba(34,211,238,0.32)] via-[rgba(76,201,240,0.2)] to-transparent',
    icon: 'from-neon-cyan-400 via-neon-blue-500 to-neon-green-400',
  },
  {
    card:
      'border-white/10 bg-[radial-gradient(circle,_rgba(236,72,153,0.18),rgba(18,16,36,0.9)),linear-gradient(145deg,rgba(16,18,36,0.92),rgba(9,11,24,0.92))]',
    glow: 'from-[rgba(236,72,153,0.32)] via-[rgba(171,78,235,0.22)] to-transparent',
    icon: 'from-neon-pink-500 via-neon-purple-500 to-neon-blue-500',
  },
  {
    card:
      'border-white/10 bg-[radial-gradient(circle,_rgba(244,214,67,0.16),rgba(14,16,30,0.9)),linear-gradient(145deg,rgba(13,17,30,0.92),rgba(8,10,22,0.92))]',
    glow: 'from-[rgba(250,204,21,0.28)] via-[rgba(251,146,60,0.22)] to-transparent',
    icon: 'from-neon-orange-500 via-neon-yellow-400 to-neon-orange-600',
  },
];

const outputDecor = [
  {
    card:
      'border-white/10 bg-[radial-gradient(circle,_rgba(34,211,238,0.16),rgba(12,16,30,0.9)),linear-gradient(145deg,rgba(10,15,28,0.92),rgba(7,10,22,0.92))]',
    glow: 'from-[rgba(45,212,191,0.3)] via-[rgba(34,211,238,0.2)] to-transparent',
    icon: 'from-neon-cyan-400 via-neon-green-400 to-neon-teal-400',
  },
  {
    card:
      'border-white/10 bg-[radial-gradient(circle,_rgba(129,140,248,0.18),rgba(14,16,36,0.9)),linear-gradient(145deg,rgba(16,18,36,0.92),rgba(9,12,26,0.92))]',
    glow: 'from-[rgba(129,140,248,0.32)] via-[rgba(76,132,255,0.2)] to-transparent',
    icon: 'from-neon-indigo-500 via-neon-blue-500 to-neon-purple-500',
  },
  {
    card:
      'border-white/10 bg-[radial-gradient(circle,_rgba(236,72,153,0.18),rgba(16,16,34,0.9)),linear-gradient(145deg,rgba(15,16,34,0.92),rgba(9,12,26,0.92))]',
    glow: 'from-[rgba(236,72,153,0.3)] via-[rgba(167,139,250,0.24)] to-transparent',
    icon: 'from-neon-purple-500 via-neon-pink-500 to-neon-blue-500',
  },
  {
    card:
      'border-white/10 bg-[radial-gradient(circle,_rgba(250,204,21,0.16),rgba(12,16,28,0.9)),linear-gradient(145deg,rgba(12,16,28,0.92),rgba(8,10,20,0.92))]',
    glow: 'from-[rgba(250,204,21,0.28)] via-[rgba(251,146,60,0.22)] to-transparent',
    icon: 'from-neon-orange-500 via-neon-yellow-400 to-neon-orange-600',
  },
];

const hubCardClass =
  'relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-neon-purple-500 via-neon-blue-500 to-neon-cyan-400 px-8 py-10 text-center text-white shadow-[0_55px_180px_-90px_rgba(18,28,76,0.68)] backdrop-blur-xl';

const hubOverlayClass =
  'pointer-events-none absolute -top-16 right-[-18%] h-48 w-48 rounded-full bg-white/20 blur-3xl opacity-70';

function renderNode(node: FlowNode, index: number, prefix: 'input' | 'output'): JSX.Element {
  const decor = prefix === 'input'
    ? inputDecor[index % inputDecor.length]
    : outputDecor[index % outputDecor.length];

  const glyph = prefix === 'input'
    ? (
      <svg
        aria-hidden='true'
        class='h-5 w-5 text-white/90'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.6'
        viewBox='0 0 20 20'
      >
        <path d='M3.5 10h9.5' />
        <path d='M9.8 6.2 13.6 10l-3.8 3.8' />
        <path d='M3.5 5.6v8.8' opacity='0.4' />
      </svg>
    )
    : (
      <svg
        aria-hidden='true'
        class='h-5 w-5 text-white/90'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.6'
        viewBox='0 0 20 20'
      >
        <path d='M16.5 10h-9.5' />
        <path d='M10.2 6.2 6.4 10l3.8 3.8' />
        <path d='M16.5 5.6v8.8' opacity='0.35' />
      </svg>
    );

  return (
    <div
      key={`${prefix}-${index}-${node.title}`}
      class={classSet([
        'group relative flex min-h-[180px] w-full flex-col items-center justify-between gap-5 overflow-hidden rounded-2xl border p-5 text-center shadow-[0_22px_65px_-60px_rgba(18,28,76,0.55)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_32px_90px_-70px_rgba(18,28,76,0.65)]',
        decor.card,
      ])}
    >
      <div
        aria-hidden='true'
        class={classSet([
          'pointer-events-none absolute -top-24 right-[-26%] h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100',
          decor.glow,
        ])}
      />
      <span
        class={classSet([
          'inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white shadow-lg shadow-black/25',
          decor.icon,
        ])}
      >
        {glyph}
      </span>
      <div class='space-y-2 text-white'>
        <h4 class='text-sm font-semibold'>{node.title}</h4>
        {node.subtitle ? <p class='text-xs text-white/70'>{node.subtitle}</p> : null}
        {node.description ? <p class='text-[0.72rem] text-white/60'>{node.description}</p> : null}
      </div>
    </div>
  );
}

export function FlowDiagramSection({
  header,
  content,
  class: className,
  ...rest
}: FlowDiagramSectionProps): JSX.Element {
  const hubDescriptionLines = content.hub.description
    ? content.hub.description.split(',').map((line) => line.trim())
    : [];

  return (
    <SectionSurface
      tone='muted'
      {...rest}
      class={classSet(['relative overflow-hidden'], { class: className })}
    >
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <div class='space-y-16'>
          <div class='space-y-4'>
            <header class='text-center text-xs font-semibold uppercase tracking-[0.4em] text-white/60'>
              Input Systems
            </header>
            <div class='grid w-full gap-4 grid-cols-4'>
              {content.inputs.map((node, index) => renderNode(node, index, 'input'))}
            </div>
          </div>

          <div class='relative flex flex-col items-center gap-6'>
            <div class='h-16 w-px bg-gradient-to-b from-transparent via-white/35 to-transparent dark:from-transparent dark:via-white/10 dark:to-transparent sm:h-20' />
            <div class={classSet([hubCardClass, 'w-full max-w-xl'])}>
              <div aria-hidden='true' class={hubOverlayClass} />
              <span class='inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-lg font-semibold tracking-tight text-white shadow-[0_20px_90px_rgba(15,23,42,0.45)]'>
                OI
              </span>
              <h3 class='mt-4 text-2xl font-semibold'>{content.hub.title}</h3>
              {hubDescriptionLines.length
                ? (
                  <ul class='mt-5 space-y-2 text-sm text-white/85'>
                    {hubDescriptionLines.map((line) => (
                      <li key={line} class='flex items-center justify-center gap-2 text-sm'>
                        <span class='h-1.5 w-1.5 rounded-full bg-white/70' />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                )
                : content.hub.description
                ? (
                  <p class='mt-4 text-[0.9rem] text-white/80'>
                    {content.hub.description}
                  </p>
                )
                : null}
            </div>
            <div class='h-16 w-px bg-gradient-to-b from-transparent via-white/35 to-transparent dark:from-transparent dark:via-white/10 dark:to-transparent sm:h-20' />
          </div>

          <div class='space-y-4'>
            <header class='text-center text-xs font-semibold uppercase tracking-[0.4em] text-white/60'>
              Output Destinations
            </header>
            <div class='grid w-full gap-4 grid-cols-4'>
              {content.outputs.map((node, index) => renderNode(node, index, 'output'))}
            </div>
          </div>
        </div>
      </div>
    </SectionSurface>
  );
}

import { classSet, ComponentChildren, JSX } from '../../.deps.ts';

export type SectionSurfaceTone = 'default' | 'muted' | 'emphasis';

export type SectionSurfaceProps = {
  children: ComponentChildren;
  tone?: SectionSurfaceTone;
} & JSX.HTMLAttributes<HTMLElement>;

const toneMap: Record<SectionSurfaceTone, string> = {
  default: 'bg-white dark:bg-neutral-950',
  muted: 'bg-neutral-100/40 dark:bg-neutral-900/40',
  emphasis: 'bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white',
};

export function SectionSurface({
  children,
  tone = 'default',
  ...rest
}: SectionSurfaceProps): JSX.Element {
  return (
    <section
      {...rest}
      class={classSet(['py-24 px-6', toneMap[tone]], rest)}
    >
      <div class='mx-auto w-full max-w-6xl'>{children}</div>
    </section>
  );
}

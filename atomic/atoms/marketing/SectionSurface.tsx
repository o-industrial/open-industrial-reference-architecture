import { classSet, ComponentChildren, JSX } from '../../.deps.ts';

export type SectionSurfaceTone = 'default' | 'muted' | 'emphasis';

export type SectionSurfaceProps = {
  children: ComponentChildren;
  tone?: SectionSurfaceTone;
  width?: 'default' | 'wide' | 'full';
  contentClass?: string;
} & Omit<JSX.HTMLAttributes<HTMLElement>, 'width'>;

const toneMap: Record<SectionSurfaceTone, string> = {
  default: 'bg-white dark:bg-neutral-950',
  muted: 'bg-neutral-100/40 dark:bg-neutral-900/40',
  emphasis: 'bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white',
};

const widthMap: Record<NonNullable<SectionSurfaceProps['width']>, string> = {
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
};

export function SectionSurface({
  children,
  tone = 'default',
  width = 'default',
  contentClass,
  ...rest
}: SectionSurfaceProps): JSX.Element {
  return (
    <section
      {...rest}
      class={classSet(['py-24 px-6', toneMap[tone]], rest)}
    >
      <div
        class={classSet([
          'relative mx-auto w-full',
          widthMap[width],
        ], {
          class: contentClass,
        })}
      >
        {children}
      </div>
    </section>
  );
}

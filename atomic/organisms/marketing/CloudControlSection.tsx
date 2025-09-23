import { classSet, ComponentType, JSX } from '../../.deps.ts';
import {
  SectionSurface,
  type SectionSurfaceProps,
} from '../../atoms/marketing/SectionSurface.tsx';
import {
  SectionHeader,
  type SectionHeaderProps,
} from '../../molecules/marketing/SectionHeader.tsx';
import {
  GradientIconBadge,
  type GradientIntent,
} from '../../atoms/marketing/GradientIconBadge.tsx';

const intentSurfaceMap: Record<GradientIntent, string> = {
  blue:
    'border-neon-blue-500/40 bg-neon-blue-500/10 dark:border-neon-blue-400/30 dark:bg-neon-blue-500/10',
  green:
    'border-emerald-500/40 bg-emerald-500/10 dark:border-emerald-400/30 dark:bg-emerald-500/10',
  purple:
    'border-neon-purple-500/40 bg-neon-purple-500/10 dark:border-neon-purple-400/30 dark:bg-neon-purple-500/10',
  orange: 'border-orange-500/40 bg-orange-500/10 dark:border-orange-400/30 dark:bg-orange-500/10',
};

const neutralSurface = 'border-neutral-200/80 bg-white/70 dark:border-white/10 dark:bg-white/5';

export type CloudControlItem = {
  title: JSX.Element | string;
  description?: JSX.Element | string;
  icon?: ComponentType<JSX.SVGAttributes<SVGSVGElement>>;
  intent?: GradientIntent;
};

export type CloudControlSectionProps = {
  header: SectionHeaderProps;
  items: CloudControlItem[];
} & Omit<SectionSurfaceProps, 'children' | 'tone'>;

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
      class={classSet(['relative overflow-hidden'], { class: className })}
    >
      <div
        aria-hidden='true'
        class='pointer-events-none absolute inset-0'
      >
        <div class='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.12),_rgba(255,255,255,0)_75%)] dark:bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_rgba(8,13,35,0)_78%)]' />
        <div class='absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10' />
      </div>
      <div class='space-y-12'>
        <SectionHeader {...header} align={header.align ?? 'center'} />

        <div class='grid gap-6 sm:grid-cols-2'>
          {items.map((item, index) => {
            const intentClass = item.intent ? intentSurfaceMap[item.intent] : neutralSurface;

            return (
              <div
                key={`cloud-control-${index}`}
                class={classSet([
                  'flex items-start gap-4 rounded-2xl border p-5 shadow-sm transition-colors backdrop-blur-sm',
                  intentClass,
                ])}
              >
                {item.icon
                  ? <GradientIconBadge icon={item.icon} intent={item.intent ?? 'blue'} size='md' />
                  : (
                    <span class='mt-1 block h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-500' />
                  )}
                <div>
                  <h4 class='text-base font-semibold text-neutral-900 dark:text-white'>
                    {item.title}
                  </h4>
                  {item.description
                    ? (
                      <p class='mt-1 text-sm text-neutral-600 dark:text-neutral-300'>
                        {item.description}
                      </p>
                    )
                    : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionSurface>
  );
}

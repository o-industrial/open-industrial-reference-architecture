import { classSet, ComponentType, JSX } from '../../.deps.ts';

export type GradientIntent = 'blue' | 'green' | 'purple' | 'orange';

export type GradientIconBadgeProps = {
  icon: ComponentType<JSX.SVGAttributes<SVGSVGElement>>;
  intent?: GradientIntent;
  size?: 'md' | 'lg';
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, 'size' | 'icon'>;

const gradientMap: Record<GradientIntent, string> = {
  blue: 'from-neon-blue-500 to-neon-cyan-400',
  green: 'from-neon-green-500 to-neon-teal-400',
  purple: 'from-neon-purple-500 to-neon-violet-400',
  orange: 'from-neon-orange-500 to-neon-yellow-400',
};

const sizeMap = {
  md: { wrapper: 'h-12 w-12', icon: 'h-6 w-6' },
  lg: { wrapper: 'h-16 w-16', icon: 'h-8 w-8' },
};

export function GradientIconBadge({
  icon: Icon,
  intent = 'blue',
  size = 'md',
  ...rest
}: GradientIconBadgeProps): JSX.Element {
  const sizing = sizeMap[size];

  return (
    <div
      {...rest}
      class={classSet(
        [
          'flex items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg',
          gradientMap[intent],
          sizing.wrapper,
        ],
        rest,
      )}
    >
      <Icon class={sizing.icon} />
    </div>
  );
}

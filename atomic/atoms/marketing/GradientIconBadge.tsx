import { classSet, JSX } from '../../.deps.ts';

export type GradientIntent = 'blue' | 'green' | 'purple' | 'orange';

export type GradientIconBadgeProps = {
  icon: JSX.ElementType;
  intent?: GradientIntent;
  size?: 'md' | 'lg';
} & JSX.HTMLAttributes<HTMLDivElement>;

const gradientMap: Record<GradientIntent, string> = {
  blue: 'from-neon-blue-500 to-neon-blue-300',
  green: 'from-emerald-500 to-emerald-300',
  purple: 'from-neon-purple-500 to-neon-purple-300',
  orange: 'from-orange-500 to-amber-400',
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

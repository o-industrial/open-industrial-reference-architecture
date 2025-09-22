import { classSet, ComponentChildren, JSX } from '../../.deps.ts';

export type EyebrowLabelIntent = 'default' | 'accent';

export type EyebrowLabelProps = {
  children: ComponentChildren;
  intent?: EyebrowLabelIntent;
} & JSX.HTMLAttributes<HTMLSpanElement>;

const intentClassMap: Record<EyebrowLabelIntent, string> = {
  default: 'text-neutral-400 dark:text-neutral-500',
  accent: 'text-neon-blue-500 dark:text-neon-blue-400',
};

export function EyebrowLabel({
  children,
  intent = 'default',
  ...rest
}: EyebrowLabelProps): JSX.Element {
  return (
    <span
      {...rest}
      class={classSet(
        [
          'uppercase tracking-[0.35em] text-xs font-semibold',
          intentClassMap[intent],
        ],
        rest,
      )}
    >
      {children}
    </span>
  );
}

import { classSet, ComponentChildren, JSX } from '../../.deps.ts';

export type TogglePillButtonProps = {
  active?: boolean;
  children: ComponentChildren;
} & JSX.HTMLAttributes<HTMLButtonElement>;

export function TogglePillButton({
  active = false,
  children,
  type,
  ...rest
}: TogglePillButtonProps): JSX.Element {
  return (
    <button
      type={type ?? 'button'}
      {...rest}
      class={classSet(
        [
          'px-3 py-1 text-xs font-semibold rounded-full transition-colors',
          active
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
            : 'bg-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100',
        ],
        rest,
      )}
    >
      {children}
    </button>
  );
}

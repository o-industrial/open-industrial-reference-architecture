import { classSet, ComponentChildren, JSX } from '../../.deps.ts';

export type StatPillProps = {
  label: string;
  value: ComponentChildren;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function StatPill({
  label,
  value,
  ...rest
}: StatPillProps): JSX.Element {
  return (
    <div
      {...rest}
      class={classSet(
        [
          'inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/70 px-3 py-1 text-xs font-medium text-neutral-600 backdrop-blur dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-300',
        ],
        rest,
      )}
    >
      <span class='text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.35em]'>
        {label}
      </span>
      <span class='text-neutral-800 dark:text-neutral-100'>{value}</span>
    </div>
  );
}

import { classSet, JSX } from '../../.deps.ts';

export type ChipListProps = {
  items: string[];
  chipClass?: string;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function ChipList({
  items,
  chipClass,
  ...rest
}: ChipListProps): JSX.Element | null {
  if (!items?.length) {
    return null;
  }

  return (
    <div
      {...rest}
      class={classSet(['flex flex-wrap gap-2'], rest)}
    >
      {items.map((item) => (
        <span
          key={item}
          class={classSet(
            [
              'inline-flex items-center rounded-full border border-neutral-300/60 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300',
            ],
            { class: chipClass },
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

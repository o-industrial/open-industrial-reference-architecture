import { classSet, JSX } from '../../.deps.ts';

export type QuoteCardProps = {
  quote: JSX.Element | string;
  attribution?: JSX.Element | string;
  role?: JSX.Element | string;
} & JSX.HTMLAttributes<HTMLElement>;

export function QuoteCard({
  quote,
  attribution,
  role,
  ...rest
}: QuoteCardProps): JSX.Element {
  return (
    <figure
      {...rest}
      class={classSet(
        [
          'rounded-2xl border border-neutral-200/80 bg-neutral-900/80 p-6 text-left shadow-md dark:border-white/10 dark:bg-neutral-900',
        ],
        rest,
      )}
    >
      <blockquote class='text-base italic text-neutral-100'>�{quote}�</blockquote>
      {(attribution || role)
        ? (
          <figcaption class='mt-4 text-sm text-neutral-400'>
            {attribution ? <div class='font-semibold text-neutral-200'>{attribution}</div> : null}
            {role ? <div>{role}</div> : null}
          </figcaption>
        )
        : null}
    </figure>
  );
}

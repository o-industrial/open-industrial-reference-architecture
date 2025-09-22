import { classSet, JSX } from '../../.deps.ts';

const surfaceClass =
  'relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-[#f2efff] via-[#f8f5ff] to-[#e8f4ff] p-6 text-left shadow-xl backdrop-blur-sm dark:border-white/10 dark:from-[#181436] dark:via-[#261d58] dark:to-[#0d1d3d]';

export type QuoteCardProps = {
  quote: JSX.Element | string;
  attribution?: JSX.Element | string;
  role?: JSX.Element | string;
} & Omit<JSX.HTMLAttributes<HTMLElement>, 'role'>;

export function QuoteCard({
  quote,
  attribution,
  role,
  ...rest
}: QuoteCardProps): JSX.Element {
  return (
    <figure
      {...rest}
      class={classSet([surfaceClass], rest)}
    >
      <div
        aria-hidden='true'
        class='pointer-events-none absolute -left-10 top-2 h-40 w-40 rounded-full bg-neon-purple-500/25 blur-3xl dark:bg-neon-purple-500/30'
      />
      <div
        aria-hidden='true'
        class='pointer-events-none absolute -bottom-12 right-[-6%] h-48 w-48 rounded-full bg-neon-blue-400/25 blur-3xl dark:bg-neon-blue-400/30'
      />
      <blockquote class='relative text-base italic text-neutral-900 dark:text-neutral-100'>
        &quot;{quote}&quot;
      </blockquote>
      {(attribution || role)
        ? (
          <figcaption class='relative mt-4 text-sm text-neutral-600 dark:text-neutral-300'>
            {attribution
              ? <div class='font-semibold text-neutral-900 dark:text-white'>{attribution}</div>
              : null}
            {role ? <div>{role}</div> : null}
          </figcaption>
        )
        : null}
    </figure>
  );
}

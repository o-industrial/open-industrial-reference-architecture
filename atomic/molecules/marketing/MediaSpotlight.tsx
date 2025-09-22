import { classSet, JSX } from '../../.deps.ts';

export type MediaAsset = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
};

export type MediaSpotlightProps = {
  media: MediaAsset;
} & Omit<JSX.HTMLAttributes<HTMLElement>, 'media'>;

const surfaceClass =
  'relative w-full overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-[#eef3ff] via-[#f9f5ff] to-[#e9f2ff] shadow-2xl backdrop-blur-md dark:border-white/10 dark:from-[#0c112a] dark:via-[#161c3f] dark:to-[#081027]';

export function MediaSpotlight({
  media,
  ...rest
}: MediaSpotlightProps): JSX.Element {
  return (
    <figure
      {...rest}
      class={classSet([surfaceClass], rest)}
    >
      <div
        aria-hidden='true'
        class='pointer-events-none absolute -left-16 top-16 h-48 w-48 rounded-full bg-neon-blue-400/25 blur-3xl dark:bg-neon-blue-400/30'
      />
      <div
        aria-hidden='true'
        class='pointer-events-none absolute -bottom-20 right-[-10%] h-64 w-64 rounded-full bg-neon-purple-500/20 blur-3xl dark:bg-neon-purple-500/30'
      />
      <img
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        class='relative h-auto w-full rounded-[26px] border border-white/50 shadow-lg'
        data-eac-bypass-base
      />
      {media.caption
        ? (
          <figcaption class='relative px-6 py-4 text-sm text-neutral-600 dark:text-neutral-300'>
            {media.caption}
          </figcaption>
        )
        : null}
    </figure>
  );
}

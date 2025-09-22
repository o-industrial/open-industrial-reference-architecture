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
} & JSX.HTMLAttributes<HTMLElement>;

export function MediaSpotlight({
  media,
  ...rest
}: MediaSpotlightProps): JSX.Element {
  return (
    <figure
      {...rest}
      class={classSet(
        [
          'w-full overflow-hidden rounded-3xl border border-neutral-200/80 bg-neutral-900/90 shadow-xl dark:border-white/10',
        ],
        rest,
      )}
    >
      <img
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        class='h-auto w-full'
        data-eac-bypass-base
      />
      {media.caption
        ? (
          <figcaption class='px-6 py-4 text-sm text-neutral-400 dark:text-neutral-500'>
            {media.caption}
          </figcaption>
        )
        : null}
    </figure>
  );
}

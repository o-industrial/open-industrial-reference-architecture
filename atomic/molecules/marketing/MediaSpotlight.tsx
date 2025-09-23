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
  'group relative w-full overflow-hidden rounded-[34px] border border-white/60 bg-gradient-to-br from-[#eef3ff] via-[#f9f5ff] to-[#e9f2ff] shadow-[0_45px_140px_-80px_rgba(62,45,171,0.5)] backdrop-blur-xl dark:border-white/10 dark:from-[#0c112a] dark:via-[#161c3f] dark:to-[#081027]';

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
        class='pointer-events-none absolute inset-0'
      >
        <div class='absolute -left-16 top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(96,165,250,0.28),_rgba(255,255,255,0)_70%)] blur-3xl dark:bg-[radial-gradient(circle,_rgba(96,165,250,0.38),_rgba(255,255,255,0)_72%)]' />
        <div class='absolute -bottom-20 right-[-10%] h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(167,139,250,0.24),_rgba(255,255,255,0)_70%)] blur-3xl dark:bg-[radial-gradient(circle,_rgba(167,139,250,0.34),_rgba(255,255,255,0)_72%)]' />
        <div class='absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/10' />
      </div>
      <div class='relative overflow-hidden rounded-[26px] border border-white/50 bg-gradient-to-br from-white/40 via-white/30 to-white/10 shadow-2xl dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-white/0'>
        <div class='absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.35)_0%,_rgba(255,255,255,0)_60%)] opacity-70 mix-blend-screen pointer-events-none' />
        <img
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          class='relative h-auto w-full rounded-[26px] border border-white/40 shadow-xl transition-transform duration-500 ease-out group-hover:translate-y-[-4px] group-hover:scale-[1.015]'
          data-eac-bypass-base
          loading='lazy'
        />
      </div>
      {media.caption
        ? (
          <figcaption class='relative px-6 pb-6 pt-4 text-sm text-neutral-600 dark:text-neutral-300'>
            {media.caption}
          </figcaption>
        )
        : null}
    </figure>
  );
}

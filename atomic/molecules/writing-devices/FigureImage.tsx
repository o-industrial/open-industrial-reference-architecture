import { JSX, classSet, IntentTypes } from '../../.deps.ts';
import { getIntentStyles } from '../../.exports.ts';

export type FigureImageSize =
  | 'auto'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'full';

export type FigureImageProps = {
  intentType?: IntentTypes;
  caption?: string;
  alt: string;
  src: string;
  center?: boolean;
  size?: FigureImageSize;
  shadow?: 'xl' | '2xl';
  glow?: boolean;
} & Omit<JSX.HTMLAttributes<HTMLImageElement>, 'size'>;

const sizeMap: Record<FigureImageSize, string> = {
  auto: '',
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
};

export function FigureImage({
  src,
  alt,
  caption,
  intentType = IntentTypes.None,
  center = false,
  size = 'md',
  shadow = 'xl',
  glow = false,
  ...imgProps
}: FigureImageProps): JSX.Element {
  const { text, ring, glow: glowClass } = getIntentStyles(intentType);

  const figureClasses = classSet(
    [
      'my-8 flex flex-col w-full',
      center ? 'mx-auto items-center text-center' : 'items-start text-left',
      sizeMap[size],
    ],
    imgProps
  );

  const imageClasses = classSet([
    'rounded-2xl',
    size === 'auto' ? 'w-auto' : 'w-full',
    ring,
    glow ? glowClass : '',
    shadow === '2xl' ? 'shadow-2xl' : 'shadow-xl',
  ]);

  return (
    <figure class={figureClasses}>
      <img
        {...imgProps}
        data-eac-bypass-base
        src={src}
        alt={alt}
        class={imageClasses}
      />
      {caption && (
        <figcaption class={`mt-4 text-sm tracking-wide uppercase ${text}`}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

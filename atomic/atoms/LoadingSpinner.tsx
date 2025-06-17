import { JSX, IntentTypes, classSet } from '../.deps.ts';
import { LoadingIcon } from '../.exports.ts';

export enum SpinnerSize {
  Sm = 'sm',
  Md = 'md',
  Lg = 'lg',
}

export type LoadingSpinnerProps = {
  spinnerSize?: SpinnerSize;
  intentType?: IntentTypes;
  fullscreen?: boolean;
  class?: string;
} & JSX.HTMLAttributes<HTMLDivElement>;

/**
 * LoadingSpinner
 *
 * A reusable animated spinner with size, intent, and layout options.
 * Aligns with IntentTypes for consistent design language.
 */
export function LoadingSpinner({
  spinnerSize = SpinnerSize.Md,
  intentType = IntentTypes.Primary,
  fullscreen = true,
  class: className,
  ...props
}: LoadingSpinnerProps): JSX.Element {
  const sizeClasses = {
    [SpinnerSize.Sm]: '-:w-6 -:h-6',
    [SpinnerSize.Md]: '-:w-10 -:h-10',
    [SpinnerSize.Lg]: '-:w-14 -:h-14',
  };

  const intentColorMap = {
    [IntentTypes.None]: '',
    [IntentTypes.Primary]: '-:text-neon-violet-400',
    [IntentTypes.Secondary]: '-:text-neon-indigo-400',
    [IntentTypes.Tertiary]: '-:text-neon-blue-400',
    [IntentTypes.Warning]: '-:text-neon-yellow-400',
    [IntentTypes.Info]: '-:text-neon-cyan-400',
    [IntentTypes.Error]: '-:text-neon-red-400',
  };

  const colorClass = intentColorMap[intentType] || '';

  const wrapperClass = fullscreen
    ? '-:absolute -:inset-0 -:w-full -:h-full -:flex -:items-center -:justify-center'
    : '-:inline-flex -:items-center -:justify-center';

  return (
    <div
      class={classSet([wrapperClass, colorClass], { class: className })}
      {...props}
    >
      <LoadingIcon class={`-:animate-spin ${sizeClasses[spinnerSize]}`} />
    </div>
  );
}

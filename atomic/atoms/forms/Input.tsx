import {
  JSX,
  IntentTypes,
  forwardRef,
  ForwardedRef,
  classSet,
  FunctionalComponent,
  Ref,
} from '../../.deps.ts';

export type InputBaseProps = {
  label?: string;
  intentType?: IntentTypes;
  multiline?: boolean;
  rows?: number;
};

export type InputProps = InputBaseProps &
  (
    | (JSX.HTMLAttributes<HTMLInputElement> & { multiline?: false })
    | (JSX.HTMLAttributes<HTMLTextAreaElement> & { multiline: true })
  );

function getIntentClasses(intent?: IntentTypes) {
  switch (intent) {
    case IntentTypes.Warning:
      return 'border-neon-yellow-500 focus:ring-neon-yellow-500';
    case IntentTypes.Error:
      return 'border-neon-red-500 focus:ring-neon-red-500';
    case IntentTypes.Info:
      return 'border-neon-cyan-500 focus:ring-neon-cyan-500';
    case IntentTypes.Secondary:
      return 'border-neon-indigo-500 focus:ring-neon-indigo-500';
    case IntentTypes.Tertiary:
      return 'border-neon-blue-500 focus:ring-neon-blue-500';
    case IntentTypes.Primary:
      return 'border-neon-violet-500 focus:ring-neon-violet-500';
    default:
      return 'border-neutral-600 focus:ring-neon-blue-500';
  }
}

export const Input: FunctionalComponent<
  React.PropsWithoutRef<InputProps> & {
    ref?: Ref<HTMLInputElement | HTMLTextAreaElement> | undefined;
  }
> = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  function Input(
    { label, intentType, multiline = false, rows = 4, disabled, ...rest },
    ref: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const baseClasses =
      'w-full px-3 py-2 rounded text-sm bg-neutral-700 text-neutral-100 placeholder:text-neutral-400 placeholder:px-1 focus:outline-none focus:ring-2 transition-all';

    const intentClass = getIntentClasses(intentType);
    const disabledClass = disabled
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : '';

    return (
      <>
        {label && (
          <label class="block text-xs font-semibold text-neutral-300 mb-1">
            {label}
          </label>
        )}
        {multiline ? (
          <textarea
            {...(rest as JSX.HTMLAttributes<HTMLTextAreaElement>)}
            ref={ref as ForwardedRef<HTMLTextAreaElement>}
            rows={rows}
            disabled={disabled}
            class={classSet([baseClasses, intentClass, disabledClass], rest)}
          />
        ) : (
          <input
            {...(rest as JSX.HTMLAttributes<HTMLInputElement>)}
            ref={ref as ForwardedRef<HTMLInputElement>}
            disabled={disabled}
            class={classSet([baseClasses, intentClass, disabledClass], rest)}
          />
        )}
      </>
    );
  }
);

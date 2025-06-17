import {
  JSX,
  IntentTypes,
  forwardRef,
  ForwardedRef,
  classSet,
  FunctionalComponent,
  Ref,
} from '../../.deps.ts';

export type SelectProps = {
  label?: string;
  intentType?: IntentTypes;
} & JSX.HTMLAttributes<HTMLSelectElement>;

function getIntentClasses(intent?: IntentTypes) {
  switch (intent) {
    case IntentTypes.Warning:
      return 'border-neon-yellow-400 focus:ring-neon-yellow-500';
    case IntentTypes.Error:
      return 'border-neon-red-400 focus:ring-neon-red-500';
    case IntentTypes.Info:
      return 'border-neon-cyan-400 focus:ring-neon-cyan-500';
    case IntentTypes.Secondary:
      return 'border-neon-indigo-400 focus:ring-neon-indigo-500';
    case IntentTypes.Tertiary:
      return 'border-neon-blue-500 focus:ring-neon-blue-500';
    case IntentTypes.Primary:
      return 'border-neon-violet-500 focus:ring-neon-violet-500';
    default:
      return 'border-neutral-600 focus:ring-neon-blue-500';
  }
}

export const Select: FunctionalComponent<
  React.PropsWithoutRef<SelectProps> & {
    ref?: Ref<HTMLSelectElement> | undefined;
  }
> = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, intentType, disabled, children, ...rest },
  ref: ForwardedRef<HTMLSelectElement>
) {
  const baseClasses =
    'w-full px-2 py-1 rounded text-sm bg-neutral-700 text-white placeholder-slate-400 border focus:outline-none focus:ring-2';
  const intentClass = getIntentClasses(intentType);
  const disabledClass = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : '';

  return (
    <div class={classSet([`w-full`], rest)}>
      {label && (
        <label class="block text-xs font-semibold text-neutral-300 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        disabled={disabled}
        class={`${baseClasses} ${intentClass} ${disabledClass}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
});

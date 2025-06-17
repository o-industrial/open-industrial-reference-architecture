import { JSX, IntentTypes, ComponentChildren, classSet } from '../.deps.ts';

export type BadgeProps = {
  intentType?: IntentTypes;
  children: ComponentChildren;
} & JSX.HTMLAttributes<HTMLDivElement>;

function getIntentClasses(intent: IntentTypes = IntentTypes.Info) {
  switch (intent) {
    case IntentTypes.Primary:
      return 'text-neon-violet-400 bg-neon-violet-900/20';
    case IntentTypes.Secondary:
      return 'text-neon-indigo-400 bg-neon-indigo-900/20';
    case IntentTypes.Tertiary:
      return 'text-neon-blue-400 bg-neon-blue-900/20';
    case IntentTypes.Warning:
      return 'text-neon-yellow-400 bg-neon-yellow-900/20';
    case IntentTypes.Error:
      return 'text-neon-red-400 bg-neon-red-900/20';
    case IntentTypes.Info:
      return 'text-neon-cyan-400 bg-neon-cyan-900/20';
    default:
      return 'text-neutral-300 bg-neutral-800';
  }
}

export function Badge({
  intentType = IntentTypes.Info,
  children,
  ...rest
}: BadgeProps): JSX.Element {
  const intentClass = getIntentClasses(intentType);
  const baseClass =
    'inline-block text-xs font-semibold px-2 py-0.5 rounded border border-transparent';

  return (
    <div {...rest} class={classSet([baseClass, intentClass], rest)}>
      {children}
    </div>
  );
}

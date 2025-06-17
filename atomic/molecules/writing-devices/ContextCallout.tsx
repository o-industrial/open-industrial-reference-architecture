import { JSX, ComponentChildren, classSet, IntentTypes } from '../../.deps.ts';
import { getIntentClasses } from '../../.exports.ts';

export type ContextCalloutProps = {
  intentType?: IntentTypes;
  children: ComponentChildren;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function ContextCallout({
  intentType = IntentTypes.Info,
  children,
  ...rest
}: ContextCalloutProps): JSX.Element {
  const intentClasses = getIntentClasses(intentType);

  return (
    <div
      {...rest}
      class={classSet(
        ['mt-6 mb-8 px-6 py-4 border-l-4 rounded', intentClasses],
        rest
      )}
    >
      {children}
    </div>
  );
}

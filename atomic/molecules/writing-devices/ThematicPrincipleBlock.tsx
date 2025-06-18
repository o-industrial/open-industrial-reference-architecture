import { ComponentChildren, classSet, IntentTypes, JSX } from '../../.deps.ts';
import { getIntentStyles } from '../../.exports.ts';

export function ThematicPrincipleBlock({
  children,
  intentType = IntentTypes.Primary,
}: {
  children: ComponentChildren;
  intentType?: IntentTypes;
}): JSX.Element {
  const { text, border, background } = getIntentStyles(intentType);

  return (
    <div
      class={classSet([
        'not-prose mt-6 mb-8 px-6 py-4 border-l-4 rounded text-sm leading-relaxed',
        text,
        border,
        background,
      ])}
    >
      {children}
    </div>
  );
}

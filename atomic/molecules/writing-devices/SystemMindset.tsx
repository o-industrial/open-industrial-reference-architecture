import { JSX, ComponentChildren, classSet, IntentTypes } from '../../.deps.ts';
import { getIntentStyles } from '../../.exports.ts';

export type SystemMindsetProps = {
  intentType?: IntentTypes;
  children: ComponentChildren;
} & JSX.HTMLAttributes<HTMLElement>;

export function SystemMindset({
  intentType = IntentTypes.Tertiary,
  children,
  ...rest
}: SystemMindsetProps): JSX.Element {
  const { border, text } = getIntentStyles(intentType);

  return (
    <aside
      {...rest}
      class={classSet(
        ['border-l-4 pl-4 italic text-sm leading-relaxed', border, text],
        rest
      )}
    >
      {children}
    </aside>
  );
}

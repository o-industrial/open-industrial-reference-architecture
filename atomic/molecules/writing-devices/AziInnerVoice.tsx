import { JSX, ComponentChildren, classSet, IntentTypes } from '../../.deps.ts';
import { getIntentClasses } from '../../.exports.ts';

export type AziInnerVoiceProps = {
  children: ComponentChildren;
  intentType?: IntentTypes;
} & JSX.HTMLAttributes<HTMLElement>;

export function AziInnerVoice({
  children,
  intentType = IntentTypes.Tertiary,
  ...rest
}: AziInnerVoiceProps): JSX.Element {
  return (
    <aside
      {...rest}
      class={classSet(
        [`border-l-4 pl-4 italic rounded-sm`, getIntentClasses(intentType)],
        rest
      )}
    >
      {children}
    </aside>
  );
}

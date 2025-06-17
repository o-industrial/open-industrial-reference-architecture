import { JSX, ComponentChildren, classSet, IntentTypes } from '../../.deps.ts';
import { getIntentClasses } from '../../.exports.ts';

export type BetaFeatureNoticeProps = {
  intentType?: IntentTypes;
  children?: ComponentChildren;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function BetaFeatureNotice({
  intentType = IntentTypes.Warning,
  children,
  ...rest
}: BetaFeatureNoticeProps): JSX.Element {
  const intentClasses = getIntentClasses(intentType);

  return (
    <div
      {...rest}
      class={classSet(
        ['mt-4 mb-4 px-4 py-3 border-l-4 text-sm rounded', intentClasses],
        rest
      )}
    >
      <strong class="font-semibold uppercase tracking-wide">
        Beta Feature:
      </strong>{' '}
      {children || 'This capability is in active development and may change.'}
    </div>
  );
}

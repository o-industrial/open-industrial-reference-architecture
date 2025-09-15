import { classSet, ComponentChildren, IntentTypes, JSX } from '../../.deps.ts';
import {
  ToggleCheckbox,
  Icon,
  Action,
  ActionStyleTypes,
  DeleteIcon,
  LinePreviewWithValue,
} from '../../.exports.ts';

export type InspectorBaseProps = {
  iconKey?: string;
  label?: string;
  status?: 'normal' | 'warning' | 'error' | 'proposal';
  class?: string;
  children?: ComponentChildren;

  impulseRates?: number[];
  impulseRateIntentType?: IntentTypes;
  yMin?: number;
  yMax?: number;

  enabled?: boolean;
  onToggleEnabled?: (next: boolean) => void;

  onDelete?: () => void;
} & JSX.HTMLAttributes<HTMLElement>;

export function InspectorBase({
  iconKey,
  label,
  status = 'normal',
  children,
  impulseRates,
  impulseRateIntentType = IntentTypes.Tertiary,
  yMin,
  yMax,
  enabled,
  onToggleEnabled,
  onDelete,
  ...props
}: InspectorBaseProps): JSX.Element {
  const intentClasses = {
    normal: '',
    warning: 'text-neon-yellow-400',
    error: 'text-neon-red-400',
    proposal: 'text-neon-cyan-400',
  }[status];

  const currentRate = impulseRates?.at(-1) ?? null;

  // Dynamic yMin/yMax if not provided
  const computedYMin =
    yMin ?? (impulseRates?.length ? Math.min(...impulseRates) - 3 : 0);
  const computedYMax =
    yMax ?? (impulseRates?.length ? Math.max(...impulseRates) + 3 : 100);

  // Remove to turn back on impulse rates
  impulseRates = undefined;

  return (
    <section
      class={classSet(
        ['relative w-full h-full flex flex-col overflow-hidden', intentClasses],
        props
      )}
      {...props}
    >
      {/* Sticky Header */}
      <div class="sticky top-0 z-10 bg-neutral-900 px-4 py-2 flex items-center justify-between border-b border-neutral-800">
        <div class="flex items-center gap-2">
          {onToggleEnabled !== undefined && (
            <ToggleCheckbox
              checked={enabled ?? true}
              onToggle={onToggleEnabled}
              title="Enable or disable node"
              checkedIntentType={IntentTypes.Info}
              uncheckedIntentType={IntentTypes.Error}
            />
          )}
          {iconKey && (
            <Icon icon={iconKey} src="/icons/iconset" class="w-5 h-5" />
          )}
          {label && (
            <h3 class="text-sm font-semibold uppercase tracking-wide">
              {label}
            </h3>
          )}
        </div>

        {onDelete && (
          <Action
            title="Delete Node"
            intentType={IntentTypes.Error}
            styleType={ActionStyleTypes.Icon}
            onClick={onDelete}
          >
            <DeleteIcon class="w-6 h-6" />
          </Action>
        )}
      </div>

      {/* Scrollable Content */}
      <div class="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-neon-cyan-700 scrollbar-track-transparent px-4 py-3 space-y-3">
        {children}
      </div>

      {impulseRates && (
        <LinePreviewWithValue
          class="flex"
          label="Impulse Rate"
          values={impulseRates}
          currentValue={currentRate}
          intent={impulseRateIntentType}
          yMin={computedYMin}
          yMax={computedYMax}
        />
      )}
    </section>
  );
}

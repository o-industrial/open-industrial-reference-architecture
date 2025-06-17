import { IntentTypes, JSX } from '../.deps.ts';
import { Action, ActionStyleTypes } from '../atoms/Action.tsx';

export type SummaryRowWithActionProps = {
  label: string;
  actionLabel: string;
  onActionClick: () => void;
  intentType?: IntentTypes;
  styleType?: ActionStyleTypes;
  class?: string;
};

export function SummaryRowWithAction({
  label,
  actionLabel,
  onActionClick,
  intentType = IntentTypes.Info,
  styleType = ActionStyleTypes.Link | ActionStyleTypes.Thin,
  class: className = '',
}: SummaryRowWithActionProps): JSX.Element {
  return (
    <div
      class={`flex items-center justify-between text-sm border border-neutral-700 rounded px-2 py-1 ${className}`}
    >
      <span class="truncate text-sm text-neutral-300">{label}</span>
      <Action
        onClick={onActionClick}
        intentType={intentType}
        styleType={styleType}
        class="ml-2 text-sm"
      >
        {actionLabel}
      </Action>
    </div>
  );
}

import { JSX, IntentTypes, useState } from '../../.deps.ts';
import {
  PriceListEditor,
  type PriceListEditorProps,
} from './PriceListEditor.tsx';
import { StringArrayEditor } from '../../atoms/StringArrayEditor.tsx';
import { Input } from '../../atoms/forms/Input.tsx';
import { Action, ActionStyleTypes } from '../../atoms/Action.tsx';

interface PlanDetails {
  Details: {
    Name: string;
    Description: string;
    Features: string[];
    [key: string]: unknown;
  };
  Prices: PriceListEditorProps['prices'];
  [key: string]: unknown;
}

export interface PlanListEditorProps {
  plans: Record<string, PlanDetails>;
  onChange: (plans: Record<string, PlanDetails>) => void;
}

export function PlanListEditor({
  plans,
  onChange,
}: PlanListEditorProps): JSX.Element {
  const [newLookup, setNewLookup] = useState<string>('');

  const addPlan = () => {
    const lookup = newLookup.trim();
    if (!lookup || plans[lookup]) return;
    onChange({
      ...plans,
      [lookup]: {
        Details: { Name: '', Description: '', Features: [] },
        Prices: {},
      },
    });
    setNewLookup('');
  };

  const removePlan = (lookup: string) => {
    const { [lookup]: _removed, ...rest } = plans;
    onChange(rest);
  };

  const updateDetail = (lookup: string, field: string, value: unknown) => {
    const plan = plans[lookup];
    onChange({
      ...plans,
      [lookup]: { ...plan, Details: { ...plan.Details, [field]: value } },
    });
  };

  const updateFeatures = (lookup: string, features: string[]) => {
    const plan = plans[lookup];
    onChange({
      ...plans,
      [lookup]: { ...plan, Details: { ...plan.Details, Features: features } },
    });
  };

  const updatePrices = (
    lookup: string,
    prices: PriceListEditorProps['prices']
  ) => {
    const plan = plans[lookup];
    onChange({ ...plans, [lookup]: { ...plan, Prices: prices } });
  };

  return (
    <div class="space-y-4">
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <Input
            label="New Plan Lookup"
            placeholder="e.g., basic"
            value={newLookup}
            onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
              setNewLookup(e.currentTarget.value)
            }
          />
        </div>
        <Action
          type="button"
          intentType={IntentTypes.Primary}
          styleType={ActionStyleTypes.Solid | ActionStyleTypes.Rounded | ActionStyleTypes.Thin}
          onClick={addPlan}
          disabled={!newLookup.trim()}
        >
          Add Plan
        </Action>
      </div>
      {Object.entries(plans).map(([lookup, plan]) => (
        <div
          key={lookup}
          class="border border-neutral-700 p-4 rounded space-y-3"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-sm">{lookup}</h3>
            <Action
              type="button"
              intentType={IntentTypes.Error}
              styleType={ActionStyleTypes.Link | ActionStyleTypes.Thin}
              onClick={() => removePlan(lookup)}
            >
              Remove
            </Action>
          </div>
          <Input
            label="Plan Name"
            placeholder="Enter plan name"
            value={plan.Details?.Name ?? ''}
            onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
              updateDetail(lookup, 'Name', e.currentTarget.value)
            }
          />
          <Input
            label="Plan Description"
            placeholder="Describe the plan"
            multiline
            rows={4}
            value={plan.Details?.Description ?? ''}
            onInput={(e: JSX.TargetedEvent<HTMLTextAreaElement, Event>) =>
              updateDetail(lookup, 'Description', e.currentTarget.value)
            }
          />
          <StringArrayEditor
            items={plan.Details?.Features || []}
            onChange={(features) => updateFeatures(lookup, features)}
            label="Features"
          />
          <PriceListEditor
            prices={plan.Prices || {}}
            onChange={(prices) => updatePrices(lookup, prices)}
          />
        </div>
      ))}
    </div>
  );
}

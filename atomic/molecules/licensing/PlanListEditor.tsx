import { JSX } from '../../.deps.ts';
import {
  PriceListEditor,
  type PriceListEditorProps,
} from './PriceListEditor.tsx';
import { StringArrayEditor } from '../../atoms/StringArrayEditor.tsx';

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
  const addPlan = () => {
    const lookup = prompt('Plan lookup');
    if (!lookup) return;
    onChange({
      ...plans,
      [lookup]: {
        Details: { Name: '', Description: '', Features: [] },
        Prices: {},
      },
    });
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
    <div class="-:-:space-y-4">
      <div class="-:-:flex -:-:items-center -:-:justify-between">
        <h2 class="-:-:text-lg -:-:font-semibold">Plans</h2>
        <button type="button" class="-:-:text-blue-400" onClick={addPlan}>
          Add Plan
        </button>
      </div>
      {Object.entries(plans).map(([lookup, plan]) => (
        <div
          key={lookup}
          class="-:-:border -:-:border-slate-700 -:-:p-4 -:-:rounded -:-:space-y-2"
        >
          <div class="-:-:flex -:-:items-center -:-:justify-between">
            <h3 class="-:-:font-semibold">{lookup}</h3>
            <button
              type="button"
              class="-:-:text-red-400"
              onClick={() => removePlan(lookup)}
            >
              Remove
            </button>
          </div>
          <input
            class="-:-:w-full -:-:p-2 -:-:rounded -:-:bg-slate-800"
            placeholder="Plan Name"
            value={plan.Details?.Name ?? ''}
            onInput={(e) =>
              updateDetail(lookup, 'Name', (e.target as HTMLInputElement).value)
            }
          />
          <textarea
            class="-:-:w-full -:-:p-2 -:-:rounded -:-:bg-slate-800"
            placeholder="Plan Description"
            value={plan.Details?.Description ?? ''}
            onInput={(e) =>
              updateDetail(
                lookup,
                'Description',
                (e.target as HTMLTextAreaElement).value
              )
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

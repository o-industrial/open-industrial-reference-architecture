import { JSX, IntentTypes } from '../../.deps.ts';
import { Input } from '../../atoms/forms/Input.tsx';
import { Action, ActionStyleTypes } from '../../atoms/Action.tsx';
import { useState } from '../../.deps.ts';

interface PriceDetails {
  Details: {
    Currency: string;
    Interval: string;
    Value: number;
    Discount: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface PriceListEditorProps {
  prices: Record<string, PriceDetails>;
  onChange: (prices: Record<string, PriceDetails>) => void;
}

export function PriceListEditor({ prices, onChange }: PriceListEditorProps): JSX.Element {
  const [newLookup, setNewLookup] = useState<string>('');

  const addPrice = () => {
    const lookup = newLookup.trim();
    if (!lookup || prices[lookup]) return;
    onChange({
      ...prices,
      [lookup]: {
        Details: { Currency: 'USD', Interval: 'month', Value: 0, Discount: 0 },
      },
    });
    setNewLookup('');
  };

  const removePrice = (lookup: string) => {
    const { [lookup]: _removed, ...rest } = prices;
    onChange(rest);
  };

  const updateDetail = (lookup: string, field: string, value: unknown) => {
    const price = prices[lookup];
    onChange({
      ...prices,
      [lookup]: { ...price, Details: { ...price.Details, [field]: value } },
    });
  };

  return (
    <div class="mt-2 space-y-3">
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <Input
            label="New Price Lookup"
            placeholder="e.g., basic-monthly"
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
          onClick={addPrice}
          disabled={!newLookup.trim()}
        >
          Add Price
        </Action>
      </div>
      {Object.entries(prices).map(([lookup, price]) => (
        <div
          key={lookup}
          class="p-3 border border-neutral-700 rounded space-y-2"
        >
          <div class="flex items-center justify-between">
            <h5 class="font-semibold text-sm">{lookup}</h5>
            <Action
              type="button"
              intentType={IntentTypes.Error}
              styleType={ActionStyleTypes.Link | ActionStyleTypes.Thin}
              onClick={() => removePrice(lookup)}
            >
              Remove
            </Action>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              label="Currency"
              placeholder="USD"
              value={price.Details?.Currency ?? ''}
              onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                updateDetail(lookup, 'Currency', e.currentTarget.value)
              }
            />
            <Input
              label="Interval"
              placeholder="month"
              value={price.Details?.Interval ?? ''}
              onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                updateDetail(lookup, 'Interval', e.currentTarget.value)
              }
            />
            <Input
              label="Value"
              type="number"
              value={price.Details?.Value ?? 0}
              onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                updateDetail(
                  lookup,
                  'Value',
                  Number.isNaN(parseFloat(e.currentTarget.value))
                    ? 0
                    : parseFloat(e.currentTarget.value)
                )
              }
            />
            <Input
              label="Discount"
              type="number"
              value={price.Details?.Discount ?? 0}
              onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                updateDetail(
                  lookup,
                  'Discount',
                  Number.isNaN(parseFloat(e.currentTarget.value))
                    ? 0
                    : parseFloat(e.currentTarget.value)
                )
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

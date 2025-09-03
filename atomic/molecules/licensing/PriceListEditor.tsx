import { JSX } from '../../.deps.ts';

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

export function PriceListEditor(
  { prices, onChange }: PriceListEditorProps,
): JSX.Element {
  const addPrice = () => {
    const lookup = prompt('Price lookup');
    if (!lookup) return;
    onChange({
      ...prices,
      [lookup]: {
        Details: { Currency: 'USD', Interval: 'month', Value: 0, Discount: 0 },
      },
    });
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
    <div class='-:-:mt-2 -:-:space-y-2'>
      <div class='-:-:flex -:-:items-center -:-:justify-between'>
        <h4 class='-:-:font-semibold'>Prices</h4>
        <button type='button' class='-:-:text-blue-400' onClick={addPrice}>
          Add Price
        </button>
      </div>
      {Object.entries(prices).map(([lookup, price]) => (
        <div
          key={lookup}
          class='-:-:p-2 -:-:border -:-:border-slate-700 -:-:rounded -:-:space-y-1'
        >
          <div class='-:-:flex -:-:items-center -:-:justify-between'>
            <h5 class='-:-:font-semibold'>{lookup}</h5>
            <button
              type='button'
              class='-:-:text-red-400'
              onClick={() => removePrice(lookup)}
            >
              Remove
            </button>
          </div>
          <input
            class='-:-:w-full -:-:p-1 -:-:rounded -:-:bg-slate-800'
            placeholder='Currency'
            value={price.Details?.Currency ?? ''}
            onInput={(e) => updateDetail(lookup, 'Currency', (e.target as HTMLInputElement).value)}
          />
          <input
            class='-:-:w-full -:-:p-1 -:-:rounded -:-:bg-slate-800'
            placeholder='Interval'
            value={price.Details?.Interval ?? ''}
            onInput={(e) => updateDetail(lookup, 'Interval', (e.target as HTMLInputElement).value)}
          />
          <input
            type='number'
            class='-:-:w-full -:-:p-1 -:-:rounded -:-:bg-slate-800'
            placeholder='Value'
            value={price.Details?.Value ?? 0}
            onInput={(e) =>
              updateDetail(
                lookup,
                'Value',
                parseFloat((e.target as HTMLInputElement).value),
              )}
          />
          <input
            type='number'
            class='-:-:w-full -:-:p-1 -:-:rounded -:-:bg-slate-800'
            placeholder='Discount'
            value={price.Details?.Discount ?? 0}
            onInput={(e) =>
              updateDetail(
                lookup,
                'Discount',
                parseFloat((e.target as HTMLInputElement).value),
              )}
          />
        </div>
      ))}
    </div>
  );
}

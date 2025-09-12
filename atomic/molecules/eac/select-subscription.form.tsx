import { JSX, classSet, useEffect, useState } from '../../.deps.ts';
import { Action } from '../../atoms/Action.tsx';
import { Select } from '../../atoms/forms/Select.tsx';

export type EaCSelectSubscriptionFormProps = JSX.HTMLAttributes<HTMLFormElement> & {
  entLookup?: string;
  cloudLookup?: string;
};

type AzureSubscription = {
  subscriptionId?: string;
  displayName?: string;
  state?: string;
};

export function EaCSelectSubscriptionForm(
  props: EaCSelectSubscriptionFormProps,
): JSX.Element {
  const { class: className, ...rest } = props as any;

  const [subs, setSubs] = useState<AzureSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [selectedSub, setSelectedSub] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/workspace/api/azure/subscriptions');
        const data = await res.json();
        if (!cancelled) {
          const list: AzureSubscription[] = Array.isArray(data) ? data : [];
          list.sort((a, b) =>
            (a.displayName || '').localeCompare(b.displayName || '', undefined, {
              sensitivity: 'base',
            })
          );
          setSubs(list);
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load subscriptions');
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <form
      method="post"
      action="/workspace/api/o-industrial/eac/clouds"
      {...rest}
      class={classSet([
        'w-full max-w-sm md:max-w-md mx-auto py-3 mt-2 space-y-4',
        className ?? '',
      ], props)}
    >
      <input id="entLookup" name="entLookup" type="hidden" value={props.entLookup} />
      <input id="cloudLookup" name="cloudLookup" type="hidden" value={props.cloudLookup} />

      <div class="grid grid-cols-1 gap-4">
        <div>
          <Select
            id="subscription-id"
            name="subscription-id"
            label="Select Subscription"
            required
            disabled={loading || !!error}
            value={selectedSub}
            onChange={(e) => setSelectedSub((e.target as HTMLSelectElement).value)}
          >
            <option value="" disabled>
              {loading ? 'Loading subscriptions…' : 'Choose a subscription'}
            </option>
            {subs.map((s) => (
              <option value={s.subscriptionId || ''}>
                {s.displayName} ({s.subscriptionId})
              </option>
            ))}
          </Select>
          {error && <p class="text-xs text-neon-yellow-400 mt-1">{error}</p>}
        </div>
      </div>

      <div class="flex justify-start pt-2">
        <Action type="submit" disabled={!selectedSub}>Connect Subscription</Action>
      </div>
    </form>
  );
}

export default EaCSelectSubscriptionForm;

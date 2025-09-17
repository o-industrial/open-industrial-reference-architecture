import { Action } from '../../atoms/Action.tsx';
import { Input } from '../../atoms/forms/Input.tsx';
import { Select } from '../../atoms/forms/Select.tsx';
import { JSX, classSet, useEffect, useMemo, useState } from '../../.deps.ts';
import { ToggleCheckbox } from '../../atoms/forms/ToggleCheckbox.tsx';

export type EaCCreateSubscriptionFormProps = JSX.HTMLAttributes<HTMLFormElement> & {
  entLookup?: string;
  cloudLookup?: string;
};

export function EaCCreateSubscriptionForm(
  props: EaCCreateSubscriptionFormProps,
): JSX.Element {
  const { class: className, ...rest } = props as any;

  const [name, setName] = useState('');
  const [isDev, setIsDev] = useState(true);
  const [billingScopes, setBillingScopes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const [selectedScope, setSelectedScope] = useState('');

  const sortedScopes = useMemo(() => {
    return Object.entries(billingScopes)
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [billingScopes]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/workspace/api/azure/billing/scopes');
        const data = await res.json();
        if (!cancelled) {
          setBillingScopes((typeof data === 'object' && data !== null) ? data : {});
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load billing scopes');
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const scopeExists = selectedScope && selectedScope in billingScopes;

    if ((!selectedScope || !scopeExists) && sortedScopes.length) {
      setSelectedScope(sortedScopes[0].id);
    } else if (!sortedScopes.length && selectedScope) {
      setSelectedScope('');
    }
  }, [billingScopes, sortedScopes, selectedScope]);

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
      <input id="billing-scope" name="billing-scope" type="hidden" value={selectedScope} />
      <input id="is-dev" name="is-dev" type="hidden" value={isDev ? 'true' : 'false'} />

      <div class="grid grid-cols-1 gap-4">
        <div>
          <Input
            id="name"
            name="name"
            type="text"
            label="Subscription Name"
            value={name}
            required
            placeholder="Enter new subscription name"
            onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
              setName((e.target as HTMLInputElement).value)
            }
          />
        </div>

        <div class="flex items-center gap-2">
          <ToggleCheckbox
            title="Dev/Test Subscription"
            checked={isDev}
            onToggle={setIsDev}
          />
          <span class="text-xs text-neutral-300">Dev/Test workload</span>
        </div>

        <div>
          <Select
            label="Billing Scope"
            value={selectedScope}
            disabled={loading || !!error || sortedScopes.length === 0}
            onChange={(e) => setSelectedScope((e.target as HTMLSelectElement).value)}
          >
            <option value="" disabled>
              {loading ? 'Loading scopes...' : 'Choose a billing scope'}
            </option>
            {sortedScopes.map((scope) => (
              <option value={scope.id}>{scope.label}</option>
            ))}
          </Select>
          {error && <p class="mt-1 text-xs text-rose-300">{error}</p>}
          {!loading && !error && sortedScopes.length === 0 && (
            <p class="mt-1 text-xs text-slate-300">
              No billing scopes found. Verify your Azure account has access to billing profiles or invoice sections.
            </p>
          )}
        </div>
      </div>

      <div class="flex justify-start pt-2">
        <Action type="submit" disabled={!selectedScope || !name}>Create Subscription</Action>
      </div>
    </form>
  );
}

export default EaCCreateSubscriptionForm;

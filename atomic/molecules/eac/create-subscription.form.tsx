import { Action } from '../../atoms/Action.tsx';
import { Input } from '../../atoms/forms/Input.tsx';
import { Select } from '../../atoms/forms/Select.tsx';
import { JSX, classSet, useEffect, useMemo, useState } from '../../.deps.ts';
import { ToggleCheckbox } from '../../atoms/forms/ToggleCheckbox.tsx';

export type EaCCreateSubscriptionFormProps = JSX.HTMLAttributes<HTMLFormElement> & {
  entLookup?: string;
  cloudLookup?: string;
};

type BillingProfile = {
  name?: string;
  displayName?: string;
  invoiceSections?: { name?: string; displayName?: string }[];
};

type BillingAccount = {
  name?: string;
  displayName?: string;
  billingProfiles?: BillingProfile[];
};

export function EaCCreateSubscriptionForm(
  props: EaCCreateSubscriptionFormProps,
): JSX.Element {
  const { class: className, ...rest } = props as any;

  const [name, setName] = useState('');
  const [isDev, setIsDev] = useState(true);
  const [accounts, setAccounts] = useState<BillingAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const [accountName, setAccountName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [sectionName, setSectionName] = useState('');

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.name === accountName),
    [accounts, accountName],
  );
  const selectedProfile = useMemo(
    () => selectedAccount?.billingProfiles?.find((p) => p.name === profileName),
    [selectedAccount, profileName],
  );

  const billingScope = useMemo(() => {
    if (!accountName || !profileName || !sectionName) return '';
    return `/providers/Microsoft.Billing/billingAccounts/${accountName}/billingProfiles/${profileName}/invoiceSections/${sectionName}`;
  }, [accountName, profileName, sectionName]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/workspace/api/azure/billing/accounts');
        const data = await res.json();
        if (!cancelled) setAccounts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError('Failed to load billing accounts');
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
      <input id="billing-scope" name="billing-scope" type="hidden" value={billingScope} />
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
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
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
            label="Billing Account"
            value={accountName}
            disabled={loading || !!error}
            onChange={(e) => {
              const v = (e.target as HTMLSelectElement).value;
              setAccountName(v);
              setProfileName('');
              setSectionName('');
            }}
          >
            <option value="" disabled selected>
              {loading ? 'Loading accounts…' : 'Choose a billing account'}
            </option>
            {accounts.map((a) => (
              <option value={a.name || ''}>{a.displayName || a.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            label="Billing Profile"
            value={profileName}
            disabled={!selectedAccount}
            onChange={(e) => {
              const v = (e.target as HTMLSelectElement).value;
              setProfileName(v);
              setSectionName('');
            }}
          >
            <option value="" disabled selected>
              {selectedAccount ? 'Choose a profile' : 'Select an account first'}
            </option>
            {selectedAccount?.billingProfiles?.map((p) => (
              <option value={p.name || ''}>{p.displayName || p.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            label="Invoice Section"
            value={sectionName}
            disabled={!selectedProfile}
            onChange={(e) => setSectionName((e.target as HTMLSelectElement).value)}
          >
            <option value="" disabled selected>
              {selectedProfile ? 'Choose an invoice section' : 'Select a profile first'}
            </option>
            {selectedProfile?.invoiceSections?.map((s) => (
              <option value={s.name || ''}>{s.displayName || s.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div class="flex justify-start pt-2">
        <Action type="submit" disabled={!billingScope || !name}>Create Subscription</Action>
      </div>
    </form>
  );
}

export default EaCCreateSubscriptionForm;


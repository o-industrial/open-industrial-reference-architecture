import { JSX, WorkspaceManager, useEffect, useState } from '../../.deps.ts';
import { Action, Modal, LoadingIcon } from '../../.exports.ts';
import { ActionStyleTypes } from '../../atoms/Action.tsx';

export type PrivateCALZModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function PrivateCALZModal({
  workspaceMgr,
  onClose,
}: PrivateCALZModalProps): JSX.Element {
  const eac = workspaceMgr.UseEaC();
  const workspaceCloud = (eac?.Clouds || {})['Workspace'];
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [locations, setLocations] = useState<{ Name: string }[]>([]);
  const [loadingLocs, setLoadingLocs] = useState(false);
  const [providersBusy, setProvidersBusy] = useState(false);

  // Step 1: Base inputs
  const [region, setRegion] = useState('');
  const [rgName, setRgName] = useState('oi-workspace-rg');
  const [baseBusy, setBaseBusy] = useState(false);
  const [baseDone, setBaseDone] = useState(false);
  const [baseErr, setBaseErr] = useState<string | undefined>(undefined);

  // Step 2: IoT inputs
  const [iotBusy, setIotBusy] = useState(false);
  const [iotDone, setIotDone] = useState(false);
  const [iotErr, setIotErr] = useState<string | undefined>(undefined);

  const loadLocations = async () => {
    try {
      setLoadingLocs(true);
      const res = await fetch('/workspace/api/azure/locations');
      const data = await res.json();
      const locs = (data?.Locations ?? []) as {
        name?: string;
        displayName?: string;
      }[];
      const mapped = locs
        .map((l) => ({ Name: l.displayName || l.name || '' }))
        .filter((l) => l.Name);
      setLocations(mapped);
      if (!region && mapped.length > 0) setRegion(mapped[0].Name);
    } catch (err) {
      console.error('Failed to load locations', err);
    } finally {
      setLoadingLocs(false);
    }
  };

  useEffect(() => {
    if (workspaceCloud?.Details) loadLocations();
  }, [!!workspaceCloud?.Details]);

  const ensureProviders = async () => {
    try {
      setProvidersBusy(true);
      const defs = {
        'Microsoft.Resources': { Types: [] },
        'Microsoft.Network': { Types: [] },
        'Microsoft.KeyVault': { Types: [] },
        'Microsoft.OperationalInsights': { Types: [] },
        'Microsoft.App': { Types: [] },
        'Microsoft.Storage': { Types: [] },
        'Microsoft.Devices': { Types: [] },
        'Microsoft.Kusto': { Types: [] },
      };
      await fetch('/workspace/api/azure/providers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(defs),
      });
    } finally {
      setProvidersBusy(false);
    }
  };

  const submitBase = async () => {
    try {
      setBaseBusy(true);
      setBaseErr(undefined);
      const res = await fetch('/workspace/api/o-industrial/calz/base', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ region, rgName }),
      });
      const data = await res.json();
      if (!data?.status) throw new Error('No status returned');
      setBaseDone(true);
      setStep(2);
    } catch (err) {
      setBaseErr((err as Error).message);
    } finally {
      setBaseBusy(false);
    }
  };

  const submitIoT = async () => {
    try {
      setIotBusy(true);
      setIotErr(undefined);
      const res = await fetch('/workspace/api/o-industrial/calz/iot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rgName }),
      });
      const data = await res.json();
      if (!data?.status) throw new Error('No status returned');
      setIotDone(true);
    } catch (err) {
      setIotErr((err as Error).message);
    } finally {
      setIotBusy(false);
    }
  };

  return (
    <Modal title="Private Open Industrial CALZ" onClose={onClose}>
      <div class="space-y-4">
        <p class="text-sm text-neutral-300">
          Configure and manage your private Open Industrial Cloud Application
          Landing Zone inside your connected cloud. This is an early preview —
          features will roll in here as we migrate our existing CALZ tooling.
        </p>

        {!workspaceCloud?.Details && (
          <div class="rounded border border-neutral-700 p-3 text-sm text-neutral-300">
            No workspace cloud is configured yet. Connect a cloud first under
            Environment → Cloud Connections.
          </div>
        )}

        {workspaceCloud?.Details && (
          <div class="rounded border border-neutral-700 p-3 text-sm text-neutral-300 space-y-4">
            <div>
              <div class="font-semibold mb-1">Workspace Cloud</div>
              <div class="text-neutral-400">
                {workspaceCloud.Details?.Name || 'Workspace Cloud'} •{' '}
                {workspaceCloud.Details?.Type || 'Azure'}
              </div>
            </div>

            {/* Stepper */}
            <div class="flex items-center gap-2 text-xs">
              <span
                class={step === 0 ? 'text-neutral-100' : 'text-neutral-400'}
              >
                0. Prereqs
              </span>
              <span>•</span>
              <span
                class={step === 1 ? 'text-neutral-100' : 'text-neutral-400'}
              >
                1. Base
              </span>
              <span>•</span>
              <span
                class={step === 2 ? 'text-neutral-100' : 'text-neutral-400'}
              >
                2. IoT
              </span>
            </div>

            {/* Step 0: Prereqs */}
            {step === 0 && (
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <Action
                    styleType={ActionStyleTypes.Outline}
                    onClick={ensureProviders}
                    disabled={providersBusy}
                  >
                    {providersBusy
                      ? 'Registering providers…'
                      : 'Ensure Providers'}
                  </Action>
                  <Action
                    styleType={ActionStyleTypes.Outline}
                    onClick={loadLocations}
                    disabled={loadingLocs}
                  >
                    {loadingLocs ? 'Loading regions…' : 'Load Regions'}
                  </Action>
                </div>
                <div class="text-neutral-400">
                  {loadingLocs ? (
                    <span class="inline-flex items-center gap-2">
                      <LoadingIcon class="w-4 h-4 animate-spin" /> Loading
                      regions…
                    </span>
                  ) : locations.length > 0 ? (
                    <span>Regions loaded: {locations.length}</span>
                  ) : (
                    <span>No regions loaded yet.</span>
                  )}
                </div>
                <div class="pt-2">
                  <Action
                    onClick={() => setStep(1)}
                    disabled={loadingLocs || providersBusy}
                  >
                    Continue to Base
                  </Action>
                </div>
              </div>
            )}

            {/* Step 1: Base */}
            {step === 1 && (
              <div class="space-y-3">
                <div>
                  <label class="block text-neutral-400 text-xs mb-1">
                    Resource Group Name
                  </label>
                  <input
                    class="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
                    value={rgName}
                    onInput={(e) =>
                      setRgName((e.target as HTMLInputElement).value)
                    }
                  />
                </div>
                <div>
                  <label class="block text-neutral-400 text-xs mb-1">
                    Region
                  </label>
                  <select
                    class="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
                    value={region}
                    onChange={(e) =>
                      setRegion((e.target as HTMLSelectElement).value)
                    }
                  >
                    {locations.map((l) => (
                      <option value={l.Name}>{l.Name}</option>
                    ))}
                  </select>
                </div>
                {baseErr && <div class="text-red-400 text-xs">{baseErr}</div>}
                <div class="flex items-center gap-2">
                  <Action
                    styleType={ActionStyleTypes.Outline}
                    onClick={() => setStep(0)}
                  >
                    Back
                  </Action>
                  <Action
                    onClick={submitBase}
                    disabled={baseBusy || !region || !rgName}
                  >
                    {baseBusy ? 'Provisioning…' : 'Provision Base'}
                  </Action>
                </div>
              </div>
            )}

            {/* Step 2: IoT */}
            {step === 2 && (
              <div class="space-y-3">
                <div class="text-neutral-400 text-sm">
                  Add core IoT services for telemetry flows. We’ll expand
                  options soon.
                </div>
                {iotErr && <div class="text-red-400 text-xs">{iotErr}</div>}
                <div class="flex items-center gap-2">
                  <Action
                    styleType={ActionStyleTypes.Outline}
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Action>
                  <Action onClick={submitIoT} disabled={iotBusy || !rgName}>
                    {iotBusy ? 'Applying…' : 'Provision IoT Layer'}
                  </Action>
                </div>
                {iotDone && (
                  <div class="text-green-500 text-xs">
                    IoT layer initialization committed.
                  </div>
                )}
              </div>
            )}

            {/* CTA: contact */}
            <div class="pt-1 text-neutral-400">
              Want it now? Email{' '}
              <a
                href="mailto:support@fathym.com?subject=Private%20CALZ%20Setup"
                class="underline text-neutral-200 hover:text-neutral-100"
              >
                support@fathym.com
              </a>{' '}
              and we’ll help set it up today.
            </div>
          </div>
        )}

        <div class="flex justify-end">
          <Action onClick={onClose}>Close</Action>
        </div>
      </div>
    </Modal>
  );
}

PrivateCALZModal.Modal = (
  workspaceMgr: WorkspaceManager
): {
  Modal: JSX.Element;
  Hide: () => void;
  IsOpen: () => boolean;
  Show: () => void;
} => {
  const [shown, setShow] = useState(false);

  return {
    Modal: (
      <>
        {shown && (
          <PrivateCALZModal
            workspaceMgr={workspaceMgr}
            onClose={() => setShow(false)}
          />
        )}
      </>
    ),
    Hide: () => setShow(false),
    IsOpen: () => shown,
    Show: () => setShow(true),
  };
};

export default PrivateCALZModal;

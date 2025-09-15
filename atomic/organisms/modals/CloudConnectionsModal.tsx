import { JSX, WorkspaceManager, useEffect, useState } from '../../.deps.ts';
import {
  Action,
  ActionStyleTypes,
  CloudConnectAzureForm,
  EaCManageCloudForm,
  EaCSelectSubscriptionForm,
  EaCCreateSubscriptionForm,
  LoadingIcon,
  Modal,
  TabbedPanel,
} from '../../.exports.ts';
import { IntentTypes } from '../../.deps.ts';

export type CloudConnectionsModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function CloudConnectionsModal({
  workspaceMgr,
  onClose,
}: CloudConnectionsModalProps): JSX.Element {
  const eac = workspaceMgr.UseEaC();
  const { isAzureConnected, loading, canUseManaged, canUsePrivate, refreshAzureStatus } =
    workspaceMgr.UseAzureAuth();

  const entLookup = eac?.EnterpriseLookup ?? '';
  const workspaceCloud = (eac?.Clouds || {})['Workspace'];
  const workspaceCloudDetails = workspaceCloud?.Details as
    | { Type?: string; Name?: string; Description?: string; SubscriptionID?: string; TenantID?: string }
    | undefined;

  const [mode, setMode] = useState<'summary' | 'connect'>(
    workspaceCloudDetails ? 'summary' : 'connect',
  );
  const [checking, setChecking] = useState(false);
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const [checkError, setCheckError] = useState<string | undefined>(undefined);

  const maskId = (id?: string) => {
    if (!id) return '—';
    const compact = id.replace(/-/g, '');
    const last = compact.slice(-4);
    return `••••-••••-••••-••••-${last}`;
  };

  const checkConnection = async () => {
    try {
      setChecking(true);
      setCheckError(undefined);
      setIsValid(undefined);
      const res = await fetch('/workspace/api/azure/validate-cloud');
      const data = await res.json();
      setIsValid(!!data?.valid);
      if (!data?.valid && data?.message) setCheckError(String(data.message));
    } catch (err) {
      setIsValid(false);
      setCheckError((err as Error).message);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (mode === 'summary' && workspaceCloudDetails) {
      // Proactively check connection status on open
      checkConnection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, !!workspaceCloudDetails]);

  return (
    <Modal title="Cloud Connections" onClose={onClose}>
      <div class="space-y-6">
        {mode === 'summary' && workspaceCloudDetails ? (
          <p class="text-sm text-neutral-300">
            Your workspace is connected to Azure. Here’s a quick, safe summary
            of the connection. Use Renew to update credentials or change the
            subscription.
          </p>
        ) : (
          <p class="text-sm text-neutral-300">
            Connect your cloud accounts and services to this workspace. Start by
            signing in with your Azure account, then choose a managed
            subscription or connect your own private Azure subscription.
          </p>
        )}

        {mode === 'summary' && workspaceCloudDetails && (
          <section class="rounded border border-neutral-700 p-4">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="font-semibold mb-2">Workspace Cloud Connection</h3>
                <dl class="text-sm text-neutral-300 grid grid-cols-2 gap-x-8 gap-y-4">
                  <dt class="text-neutral-400">Provider</dt>
                  <dd>{workspaceCloudDetails.Type ?? 'Azure'}</dd>

                  <dt class="text-neutral-400">Name</dt>
                  <dd>{workspaceCloudDetails.Name ?? 'Workspace Cloud'}</dd>

                  <dt class="text-neutral-400">Subscription</dt>
                  <dd>{maskId(workspaceCloudDetails.SubscriptionID)}</dd>

                  <dt class="text-neutral-400">Tenant</dt>
                  <dd>{maskId(workspaceCloudDetails.TenantID)}</dd>
                </dl>
              </div>

              <div class="min-w-[220px]">
                <div class="rounded border border-neutral-700 p-3">
                  <div class="flex items-center gap-2 text-sm">
                    {checking ? (
                      <>
                        <LoadingIcon class="animate-spin w-4 h-4" />
                        <span>Checking connection…</span>
                      </>
                    ) : isValid === true ? (
                      <>
                        <span class="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        <span>Connection valid</span>
                      </>
                    ) : isValid === false ? (
                      <>
                        <span class="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                        <span>Connection failed</span>
                      </>
                    ) : (
                      <>
                        <span class="inline-block w-2 h-2 rounded-full bg-neutral-500"></span>
                        <span>Status unknown</span>
                      </>
                    )}
                  </div>
                  {checkError && (
                    <p class="mt-2 text-xs text-red-400 break-all">{checkError}</p>
                  )}
                  <div class="mt-3 flex gap-2">
                    <Action
                      intentType={IntentTypes.Primary}
                      styleType={ActionStyleTypes.Outline}
                      disabled={checking}
                      onClick={checkConnection}
                    >
                      {checking ? 'Checking…' : 'Recheck Connection'}
                    </Action>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 flex gap-2">
              <Action
                intentType={IntentTypes.Primary}
                onClick={() => setMode('connect')}
              >
                Renew Connection
              </Action>
            </div>
          </section>
        )}

        {/* When in connect mode (or no existing cloud), show the original UI */}
        {mode === 'connect' && (
          <>
            {/* Upgrade gating first: if user lacks both rights, show message only */}
            {!canUseManaged && !canUsePrivate && (
              <section class="rounded border border-neutral-700 p-4">
                <h3 class="font-semibold mb-2">Upgrade Needed</h3>
                <p class="text-sm text-neutral-300">
                  Your current plan does not include access to connect managed or
                  private Azure subscriptions. Upgrade to the Pro or Sovereign plan
                  to enable cloud connections for this workspace.
                </p>
              </section>
            )}

            {/* Managed does not require Azure sign-in */}
            {canUseManaged && (
              <section class="rounded border border-neutral-700 p-4">
                <h3 class="font-semibold mb-2">Managed Subscription</h3>
                <p class="text-sm text-neutral-400 mb-4">
                  Create a subscription in our tenant under our billing. We will
                  provision and store a service principal for this workspace.
                </p>

                <div class="flex gap-2">
                  <Action
                    intentType={IntentTypes.Primary}
                    styleType={ActionStyleTypes.Outline}
                    onClick={() => alert('Managed subscription flow coming soon')}
                  >
                    Create Managed Subscription
                  </Action>
                </div>
              </section>
            )}

            {/* Private requires Azure sign-in. If allowed, show spinner->signin->forms flow */}
            {canUsePrivate && (
              <section class="rounded border border-neutral-700 p-4">
                <h3 class="font-semibold mb-2">Private Azure Cloud</h3>
                <p class="text-sm text-neutral-400 mb-4">Choose how to connect:</p>

                {loading && (
                  <div class="flex justify-center items-center py-8">
                    <LoadingIcon class="animate-spin w-10 h-10" />
                  </div>
                )}

                {!loading && !isAzureConnected && (
                  <div>
                    <p class="text-sm text-neutral-400 mb-3">
                      Use Microsoft login to authorize Open Industrial to discover
                      subscriptions and help create service principals as needed.
                    </p>

                    {/* Override the default action with our runtime MSAL endpoint */}
                    <CloudConnectAzureForm
                      action="/azure/oauth/signin"
                      data-eac-bypass-base
                      actionText="Sign in with Microsoft"
                      onSubmitCapture={() => setTimeout(() => refreshAzureStatus(), 1500)}
                    />
                  </div>
                )}

                {!loading && isAzureConnected && (
                  <TabbedPanel
                    tabs={[
                      {
                        key: 'existing',
                        label: 'Select Subscription',
                        content: (
                          <EaCSelectSubscriptionForm
                            data-eac-bypass-base
                            entLookup={entLookup}
                            cloudLookup={''}
                          />
                        ),
                      },
                      {
                        key: 'create',
                        label: 'Create Subscription',
                        content: (
                          <EaCCreateSubscriptionForm
                            data-eac-bypass-base
                            entLookup={entLookup}
                            cloudLookup={''}
                          />
                        ),
                      },
                      {
                        key: 'manual',
                        label: 'Manual (IDs + Secret)',
                        content: (
                          <EaCManageCloudForm
                            action="/workspace/api/o-industrial/eac/clouds"
                            data-eac-bypass-base
                            entLookup={entLookup}
                            cloudLookup={''}
                          />
                        ),
                      },
                    ]}
                  />
                )}

                {workspaceCloudDetails && (
                  <div class="mt-4">
                    <Action
                      styleType={ActionStyleTypes.Outline}
                      onClick={() => setMode('summary')}
                    >
                      Back to Overview
                    </Action>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        

        <div class="flex justify-end gap-2 pt-2">
          <Action onClick={onClose}>Close</Action>
        </div>
      </div>
    </Modal>
  );
}

CloudConnectionsModal.Modal = (
  workspaceMgr: WorkspaceManager,
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
          <CloudConnectionsModal workspaceMgr={workspaceMgr} onClose={() => setShow(false)} />
        )}
      </>
    ),
    Hide: () => setShow(false),
    IsOpen: () => shown,
    Show: () => setShow(true),
  };
};

export default CloudConnectionsModal;

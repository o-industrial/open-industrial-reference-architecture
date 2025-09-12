import { JSX, WorkspaceManager, useState } from '../../.deps.ts';
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

  return (
    <Modal title="Cloud Connections" onClose={onClose}>
      <div class="space-y-6">
        <p class="text-sm text-neutral-300">
          Connect your cloud accounts and services to this workspace. Start by
          signing in with your Azure account, then choose a managed subscription
          or connect your own private Azure subscription.
        </p>

        {/* Upgrade gating first: if user lacks both rights, show message only */}
        {!canUseManaged && !canUsePrivate && (
          <section class="rounded border border-neutral-700 p-4">
            <h3 class="font-semibold mb-2">Upgrade Needed</h3>
            <p class="text-sm text-neutral-300">
              Your current plan does not include access to connect managed or private
              Azure subscriptions. Upgrade to the Pro or Sovereign plan to enable
              cloud connections for this workspace.
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
            <p class="text-sm text-neutral-400 mb-4">
              Choose how to connect:
            </p>

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
          </section>
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


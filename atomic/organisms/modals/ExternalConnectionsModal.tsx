import { JSX, WorkspaceManager, useState } from '../../.deps.ts';
import {
  Action,
  ActionStyleTypes,
  CloudConnectAzureForm,
  EaCManageCloudForm,
  EaCSelectSubscriptionForm,
  EaCCreateSubscriptionForm,
  Modal,
  TabbedPanel,
} from '../../.exports.ts';
import { IntentTypes } from '../../.deps.ts';

export type ExternalConnectionsModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
  canUseManaged?: boolean;
  canUsePrivate?: boolean;
};

export function ExternalConnectionsModal({
  workspaceMgr,
  onClose,
  canUseManaged = true,
  canUsePrivate = true,
}: ExternalConnectionsModalProps): JSX.Element {
  const eac = workspaceMgr.UseEaC();
  const { isAzureConnected, refreshAzureStatus } = workspaceMgr.UseAzureAuth();

  const entLookup = eac?.EnterpriseLookup ?? '';

  return (
    <Modal title="External Connections" onClose={onClose}>
      <div class="space-y-6">
        <p class="text-sm text-neutral-300">
          Connect your cloud accounts and services to this workspace. Start by
          signing in with your Azure account, then choose a managed subscription
          or connect your own private Azure subscription.
        </p>

        {!isAzureConnected && (
          <section class="rounded border border-neutral-700 p-4">
            <h3 class="font-semibold mb-2">Sign in to Azure</h3>

            <p class="text-sm text-neutral-400 mb-3">
              Use Microsoft login to authorize Open Industrial to discover
              subscriptions and help create service principals as needed.
            </p>

            {/* Override the default action with our runtime MSAL endpoint */}
            <CloudConnectAzureForm
              action="/azure/oauth/signin"
              data-eac-bypass-base
              actionText="Sign in with Microsoft"
              onSubmitCapture={() =>
                setTimeout(() => refreshAzureStatus(), 1500)
              }
            />
          </section>
        )}

        {isAzureConnected && canUseManaged && (
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

        {isAzureConnected && canUsePrivate && (
          <section class="rounded border border-neutral-700 p-4">
              <h3 class="font-semibold mb-2">Private Azure Cloud</h3>
              <p class="text-sm text-neutral-400 mb-4">
                Choose how to connect:
              </p>

              <TabbedPanel
                tabs={[
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
                ]}
              />
          </section>
        )}

        <div class="flex justify-end gap-2 pt-2">
          <Action onClick={onClose}>Close</Action>
        </div>
      </div>
    </Modal>
  );
}

ExternalConnectionsModal.Modal = (
  workspaceMgr: WorkspaceManager,
  opts?: { canUseManaged?: boolean; canUsePrivate?: boolean }
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
          <ExternalConnectionsModal
            workspaceMgr={workspaceMgr}
            canUseManaged={opts?.canUseManaged ?? true}
            canUsePrivate={opts?.canUsePrivate ?? true}
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

export default ExternalConnectionsModal;

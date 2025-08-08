import { JSX, WorkspaceManager, useState, IntentTypes } from "../../.deps.ts";
import { Modal, Action, ActionStyleTypes } from "../../.exports.ts";

export type CurrentLicenseModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function CurrentLicenseModal({
  workspaceMgr,
  onClose,
}: CurrentLicenseModalProps): JSX.Element {
  void workspaceMgr;

  const license: {
    name: string;
    price: string;
    features: string[];
  } | null = null; // Placeholder; real license info will be loaded later

  const plans = [
    { id: "basic", name: "Basic", price: "$0/mo", features: ["1 workspace", "Community support"] },
    {
      id: "pro",
      name: "Pro",
      price: "$29/mo",
      features: ["Unlimited workspaces", "Email support", "Advanced APIs"],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Contact us",
      features: ["All Pro features", "Dedicated support", "Custom SLAs"],
    },
  ];

  return (
    <Modal title="Current License" onClose={onClose}>
      <div class="space-y-6 text-sm">
        {license ? (
          <section>
            <h3 class="text-lg font-semibold mb-2">Current Plan</h3>
            <div class="border border-neutral-700 rounded p-4">
              <p class="font-semibold">{license.name}</p>
              <p class="text-neutral-400">{license.price}</p>
              <ul class="list-disc list-inside mt-2">
                {license.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          </section>
        ) : (
          <section class="space-y-3">
            <p>No active license found. A license is required to access billing and API features.</p>
            <Action intentType={IntentTypes.Primary} onClick={() => {}}>
              Purchase License
            </Action>
          </section>
        )}

        <section>
          <h3 class="text-lg font-semibold mb-2">Available Plans</h3>
          <div class="grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <div key={p.id} class="border border-neutral-700 rounded p-4 flex flex-col gap-2">
                <p class="font-semibold">{p.name}</p>
                <p class="text-neutral-400">{p.price}</p>
                <ul class="list-disc list-inside flex-1">
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <Action
                  onClick={() => {}}
                  styleType={ActionStyleTypes.Outline}
                  intentType={IntentTypes.Primary}
                  class="mt-2"
                >
                  {license?.name === p.name ? "Selected" : "Select"}
                </Action>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* TODO: integrate OpenIndustrialAPIClient.Licenses.List() and Update() */}
    </Modal>
  );
}

CurrentLicenseModal.Modal = (workspaceMgr: WorkspaceManager) => {
  const [shown, setShow] = useState(false);

  return {
    Modal: (
      <>
        {shown && (
          <CurrentLicenseModal workspaceMgr={workspaceMgr} onClose={() => setShow(false)} />
        )}
      </>
    ),
    Hide: () => setShow(false),
    IsOpen: () => shown,
    Show: () => setShow(true),
  };
};

export default CurrentLicenseModal;

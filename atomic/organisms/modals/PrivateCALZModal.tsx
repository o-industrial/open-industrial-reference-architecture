import { JSX, WorkspaceManager, useState } from '../../.deps.ts';
import { Action, Modal } from '../../.exports.ts';

export type PrivateCALZModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function PrivateCALZModal({ workspaceMgr, onClose }: PrivateCALZModalProps): JSX.Element {
  const eac = workspaceMgr.UseEaC();
  const workspaceCloud = (eac?.Clouds || {})['Workspace'];

  return (
    <Modal title="Private Open Industrial CALZ" onClose={onClose}>
      <div class="space-y-4">
        <p class="text-sm text-neutral-300">
          Configure and manage your private Open Industrial Cloud Application Landing Zone
          inside your connected cloud. This is an early preview — features will roll in here
          as we migrate our existing CALZ tooling.
        </p>

        {!workspaceCloud?.Details && (
          <div class="rounded border border-neutral-700 p-3 text-sm text-neutral-300">
            No workspace cloud is configured yet. Connect a cloud first under
            Environment → Cloud Connections.
          </div>
        )}

        {workspaceCloud?.Details && (
          <div class="rounded border border-neutral-700 p-3 text-sm text-neutral-300">
            <div class="font-semibold mb-1">Workspace Cloud</div>
            <div class="text-neutral-400">
              {workspaceCloud.Details?.Name || 'Workspace Cloud'} • {workspaceCloud.Details?.Type || 'Azure'}
            </div>
            <div class="mt-3 text-neutral-400">
              Coming soon: landing zone resources, policies, identity, and region selection.
              <br />
              Want it now? Email{' '}
              <a
                href="mailto:support@fathym.com?subject=Private%20CALZ%20Setup"
                class="underline text-neutral-200 hover:text-neutral-100"
              >
                support@fathym.com
              </a>
              {' '}and we’ll help set it up today.
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
  workspaceMgr: WorkspaceManager,
): {
  Modal: JSX.Element;
  Hide: () => void;
  IsOpen: () => boolean;
  Show: () => void;
} => {
  const [shown, setShow] = useState(false);

  return {
    Modal: <>{shown && (<PrivateCALZModal workspaceMgr={workspaceMgr} onClose={() => setShow(false)} />)}</>,
    Hide: () => setShow(false),
    IsOpen: () => shown,
    Show: () => setShow(true),
  };
};

export default PrivateCALZModal;


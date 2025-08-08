import { JSX, WorkspaceManager, useState } from "../../.deps.ts";
import { Modal } from "../../.exports.ts";

export type WarmQueryAPIsModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function WarmQueryAPIsModal({
  workspaceMgr,
  onClose,
}: WarmQueryAPIsModalProps): JSX.Element {
  void workspaceMgr;

  return (
    <Modal title="Warm Query APIs" onClose={onClose}>
      <p>Coming soon...</p>
    </Modal>
  );
}

WarmQueryAPIsModal.Modal = (workspaceMgr: WorkspaceManager) => {
  const [shown, setShow] = useState(false);

  return {
    Modal: (
      <>
        {shown && (
          <WarmQueryAPIsModal workspaceMgr={workspaceMgr} onClose={() => setShow(false)} />
        )}
      </>
    ),
    Hide: () => setShow(false),
    IsOpen: () => shown,
    Show: () => setShow(true),
  };
};

export default WarmQueryAPIsModal;

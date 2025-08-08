import { JSX, WorkspaceManager, useState } from '../../.deps.ts';
import { Modal, Action, ActionStyleTypes } from '../../.exports.ts';

export type DataAPISuiteModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function DataAPISuiteModal({
  workspaceMgr,
  onClose,
}: DataAPISuiteModalProps): JSX.Element {
  void workspaceMgr;

  return (
    <Modal title="Data API Suite" onClose={onClose}>
      <div class="space-y-6 text-sm">
        {/* Data Connections Section */}
        <section>
          <h3 class="text-lg font-semibold mb-2">Data Connections</h3>
          <ul class="list-disc list-inside space-y-1">
            <li>IoT Hub 1 (placeholder)</li>
            <li>IoT Hub 2 (placeholder)</li>
          </ul>
        </section>

        {/* Schemas Section */}
        <section>
          <h3 class="text-lg font-semibold mb-2">Schemas</h3>
          <p>Schema listings coming soon...</p>
        </section>

        {/* Surfaces Section */}
        <section>
          <h3 class="text-lg font-semibold mb-2">Surfaces</h3>
          <p>Surface listings coming soon...</p>
        </section>

        {/* API Keys & Endpoints Section */}
        <section>
          <h3 class="text-lg font-semibold mb-2">API Keys &amp; Endpoints</h3>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <code class="flex-1">api-key-placeholder</code>
              <Action
                styleType={ActionStyleTypes.Outline}
                onClick={() =>
                  navigator.clipboard.writeText('api-key-placeholder')
                }
              >
                Copy Key
              </Action>
            </div>
            <div class="flex items-center gap-2">
              <code class="flex-1">https://api.example.com</code>
              <Action
                styleType={ActionStyleTypes.Outline}
                onClick={() =>
                  navigator.clipboard.writeText('https://api.example.com')
                }
              >
                Copy URL
              </Action>
            </div>
          </div>
        </section>
      </div>

      {/* TODO: hook up real data connections, schemas, surfaces, and API keys via workspaceMgr */}
    </Modal>
  );
}

DataAPISuiteModal.Modal = (
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
          <DataAPISuiteModal
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

export default DataAPISuiteModal;

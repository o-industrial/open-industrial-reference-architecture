import {
  JSX,
  WorkspaceManager,
  IntentTypes,
  useState,
  EaCEnterpriseDetails,
} from '../../.deps.ts';
import {
  Modal,
  TabbedPanel,
  Input,
  Action,
  ActionStyleTypes,
} from '../../.exports.ts';
import { TeamManagementModal } from './TeamManagementModal.tsx';
import { ManageWorkspacesModal } from './ManageWorkspacesModal.tsx';

type WorkspaceSettingsModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function WorkspaceSettingsModal({
  workspaceMgr,
  onClose,
}: WorkspaceSettingsModalProps): JSX.Element {
  const { currentWorkspace, update, save, archive, hasChanges } =
    workspaceMgr.UseWorkspaceSettings();

  const { Modal: teamModal, Show: showTeamModal } =
    TeamManagementModal.Modal(workspaceMgr);
  const { Modal: mngWkspcsModal, Show: showMngWkspcs } =
    ManageWorkspacesModal.Modal(workspaceMgr);

  const details: EaCEnterpriseDetails = currentWorkspace.Details;

  return (
    <>
      <Modal title="Workspace Settings" onClose={onClose}>
        <WorkspaceDetailsTab
          details={details}
          onUpdate={update}
          onSave={() => save().then()}
          onArchive={archive}
          hasChanges={hasChanges}
          onManageTeam={() => showTeamModal()}
          onManageWorkspaces={() => showMngWkspcs()}
        />
      </Modal>
      {teamModal}
      {mngWkspcsModal}
    </>
  );
}

WorkspaceSettingsModal.Modal = (
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
          <WorkspaceSettingsModal
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

function WorkspaceDetailsTab({
  details,
  onUpdate,
  onSave,
  onArchive,
  hasChanges,
  onManageTeam,
  onManageWorkspaces,
}: {
  details: EaCEnterpriseDetails;
  onUpdate: (next: Partial<EaCEnterpriseDetails>) => void;
  onSave: () => void;
  onArchive: () => void;
  hasChanges: boolean;
  onManageTeam: () => void;
  onManageWorkspaces: () => void;
}) {
  return (
    <div class="space-y-4">
      <Input
        label="Workspace Name"
        value={details.Name}
        onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
          onUpdate({ Name: (e.target as HTMLInputElement).value })
        }
      />
      <Input
        multiline
        label="Description"
        value={details.Description}
        onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
          onUpdate({ Description: (e.target as HTMLInputElement).value })
        }
      />

      {/* <div class="text-xs text-neutral-400 space-y-1">
        <div>Created At: {details.CreatedAt}</div>
        <div>Workspace ID: {details.ID}</div>
      </div> */}

      <div class="flex justify-between mt-4 gap-2">
        <Action onClick={onSave} disabled={!hasChanges}>
          Save Changes
        </Action>
        <div class="flex gap-2">
          <Action
            intentType={IntentTypes.Primary}
            styleType={ActionStyleTypes.Outline}
            onClick={onManageTeam}
          >
            Manage Team Members
          </Action>
          <Action
            intentType={IntentTypes.Primary}
            styleType={ActionStyleTypes.Outline}
            onClick={onManageWorkspaces}
          >
            Manage Workspaces
          </Action>
          <Action
            onClick={() => {
              if (confirm('Are you sure you want to archive this workspace?')) {
                onArchive();
              }
            }}
            intentType={IntentTypes.Error}
            styleType={ActionStyleTypes.Outline}
          >
            🧊 Archive Workspace
          </Action>
        </div>
      </div>
    </div>
  );
}

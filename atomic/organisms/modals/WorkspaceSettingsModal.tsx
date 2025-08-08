import {
  JSX,
  WorkspaceManager,
  IntentTypes,
  useState,
  EaCEnterpriseDetails,
  WorkspaceSummary,
} from '../../.deps.ts';
import {
  Modal,
  TabbedPanel,
  Input,
  Action,
  ActionStyleTypes,
  Badge,
} from '../../.exports.ts';
import { TeamManagementModal } from './TeamManagementModal.tsx';

type WorkspaceSettingsModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function WorkspaceSettingsModal({
  workspaceMgr,
  onClose,
}: WorkspaceSettingsModalProps): JSX.Element {
  const {
    currentWorkspace,
    update,
    save,
    archive,
    hasChanges,
    workspaces,
    switchToWorkspace,
  } = workspaceMgr.UseWorkspaceSettings();

  const [showTeamModal, setShowTeamModal] = useState(false);

  const details: EaCEnterpriseDetails = currentWorkspace.Details;

  return (
    <>
      <Modal title="Workspace Settings" onClose={onClose}>
        <TabbedPanel
          direction="vertical"
          tabs={[
            {
              key: 'details',
              label: '🛠️ Workspace Details',
              content: (
                <WorkspaceDetailsTab
                  details={details}
                  onUpdate={update}
                  onSave={() => save().then()}
                  onArchive={archive}
                  hasChanges={hasChanges}
                  onManageTeam={() => setShowTeamModal(true)}
                />
              ),
            },
            {
              key: 'switch',
              label: '🔄 Switch Workspace',
              content: (
                <SwitchWorkspaceTab
                  currentId={currentWorkspace.Lookup}
                  workspaces={workspaces}
                  onSwitch={switchToWorkspace}
                />
              ),
            },
          ]}
        />
      </Modal>
      {showTeamModal && (
        <TeamManagementModal
          workspaceMgr={workspaceMgr}
          onClose={() => setShowTeamModal(false)}
        />
      )}
    </>
  );
}

export interface ModalController {
  Modal: JSX.Element;
  Hide: () => void;
  IsOpen: () => boolean;
  Show: () => void;
}

WorkspaceSettingsModal.Modal = (
  workspaceMgr: WorkspaceManager
): ModalController => {
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
}: {
  details: EaCEnterpriseDetails;
  onUpdate: (next: Partial<EaCEnterpriseDetails>) => void;
  onSave: () => void;
  onArchive: () => void;
  hasChanges: boolean;
  onManageTeam: () => void;
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

function SwitchWorkspaceTab({
  currentId,
  workspaces,
  onSwitch,
}: {
  currentId: string;
  workspaces: WorkspaceSummary[];
  onSwitch: (id: string) => void;
}) {
  const [filter, setFilter] = useState('');

  const filtered = workspaces.filter((ws) =>
    ws.Details.Name!.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div class="space-y-4">
      <Input
        placeholder="Filter workspaces..."
        value={filter}
        onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
          setFilter((e.target as HTMLInputElement).value)
        }
      />

      <div class="space-y-2">
        {filtered.map((ws) => (
          <div
            class="p-2 border rounded hover:bg-neutral-800 cursor-pointer"
            onClick={() => onSwitch(ws.Lookup)}
          >
            <div class="text-sm font-semibold">{ws.Details.Name}</div>
            <div class="text-xs text-neutral-400">{ws.Details.Description}</div>
            {ws.Lookup === currentId && <Badge>Current</Badge>}
          </div>
        ))}
      </div>

      <Action onClick={() => alert('Create new workspace TBD')} class="mt-4">
        + Create New Workspace
      </Action>
    </div>
  );
}

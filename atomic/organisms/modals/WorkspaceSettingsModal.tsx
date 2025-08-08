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
  Select,
  Badge,
} from '../../.exports.ts';

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
    teamMembers,
    inviteMember,
    removeMember,
    update,
    save,
    archive,
    hasChanges,
    workspaces,
    switchToWorkspace,
  } = workspaceMgr.UseWorkspaceSettings();

  const details: EaCEnterpriseDetails = currentWorkspace.Details;

  return (
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
              />
            ),
          },
          {
            key: 'team',
            label: '👥 Team Members',
            content: (
              <TeamMembersTab
                teamMembers={teamMembers}
                onInvite={inviteMember}
                onRemove={removeMember}
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
  );
}

WorkspaceSettingsModal.Modal = (workspaceMgr: WorkspaceManager) => {
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
}: {
  details: EaCEnterpriseDetails;
  onUpdate: (next: Partial<EaCEnterpriseDetails>) => void;
  onSave: () => void;
  onArchive: () => void;
  hasChanges: boolean;
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

      <div class="flex justify-between mt-4">
        <Action onClick={onSave} disabled={!hasChanges}>
          Save Changes
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
  );
}

function TeamMembersTab({
  teamMembers,
  onInvite,
  onRemove,
}: {
  teamMembers: { Email: string; Role: string }[];
  onInvite: (email: string, role: string) => void;
  onRemove: (email: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Viewer');

  return (
    <div class="space-y-4">
      <div class="text-sm text-neutral-300 font-medium">Current Members</div>
      <div class="space-y-2">
        {teamMembers.map((member) => (
          <div class="flex justify-between items-center border p-2 rounded">
            <div class="text-sm">{member.Email}</div>
            <div class="flex items-center gap-2">
              <Select value={member.Role} disabled>
                <option>Owner</option>
                <option>Editor</option>
                <option>Viewer</option>
              </Select>

              <Action
                onClick={() => onRemove(member.Email)}
                intentType={IntentTypes.Error}
                styleType={ActionStyleTypes.Icon}
              >
                ✖
              </Action>
            </div>
          </div>
        ))}
      </div>

      <div class="text-sm text-neutral-300 font-medium pt-4">Invite Member</div>
      <div class="flex items-center gap-2">
        <Input
          placeholder="Email"
          value={email}
          onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
            setEmail((e.target as HTMLInputElement).value)
          }
        />
        <Select
          value={role}
          onChange={(e: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
            setRole((e.target as HTMLSelectElement).value)
          }
        >
          <option>Viewer</option>
          <option>Editor</option>
          <option>Owner</option>
        </Select>
        <Action onClick={() => onInvite(email, role)}>Invite</Action>
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

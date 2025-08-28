import { JSX, WorkspaceManager, IntentTypes, useState } from '../../.deps.ts';
import {
  Modal,
  Input,
  Select,
  Action,
  ActionStyleTypes,
} from '../../.exports.ts';

export type TeamManagementModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function TeamManagementModal({
  workspaceMgr,
  onClose,
}: TeamManagementModalProps): JSX.Element {
  const {
    currentWorkspace,
    teamMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
  } = workspaceMgr.UseWorkspaceSettings();

  const [selected, setSelected] = useState<string[]>([]);
  const [bulkRole, setBulkRole] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Owner' | 'Editor' | 'Viewer'>('Viewer');

  const toggleSelected = (email: string) => {
    setSelected((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleBulkChange = (nextRole: string) => {
    setBulkRole('');
    if (!nextRole) return;
    selected.forEach((email) =>
      updateMemberRole(email, nextRole as 'Owner' | 'Editor' | 'Viewer')
    );
    setSelected([]);
  };

  const friendlyDate = (joined?: string) => {
    if (!joined) return 'N/A';
    try {
      return new Date(joined).toLocaleDateString();
    } catch {
      return joined;
    }
  };

  return (
    <Modal
      title={`Teams: ${currentWorkspace.Details.Name} Members`}
      onClose={onClose}
    >
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div class="text-sm text-neutral-300 font-medium">
            Current Members
          </div>
          {/* <Select
            value={bulkRole}
            onChange={(e: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
              handleBulkChange((e.target as HTMLSelectElement).value)
            }
          >
            <option value="">Bulk change role...</option>
            <option value="Owner">Owner</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </Select> */}
        </div>

        <div class="space-y-2 max-h-64 overflow-y-auto">
          {teamMembers.map((member) => (
            <div
              class="grid grid-cols-[auto_1fr_1fr_auto_auto_auto] items-center gap-2 border p-2 rounded"
              key={member.Username}
            >
              <input
                type="checkbox"
                checked={selected.includes(member.Username)}
                onChange={() => toggleSelected(member.Username)}
              />
              <div class="text-sm">{member.Username ?? 'N/A'}</div>
              <div class="text-sm">{member.Username}</div>
              {/* <Select
                value={member.Role}
                onChange={(e: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
                  updateMemberRole(
                    member.Email,
                    (e.target as HTMLSelectElement).value as
                      | 'Owner'
                      | 'Editor'
                      | 'Viewer'
                  )
                }
              >
                <option>Owner</option>
                <option>Editor</option>
                <option>Viewer</option>
              </Select> */}
              <div class="text-sm">{friendlyDate(member.Joined)}</div>
              <Action
                onClick={() => removeMember(member.Username)}
                intentType={IntentTypes.Error}
                styleType={ActionStyleTypes.Icon}
              >
                ✖
              </Action>
            </div>
          ))}
        </div>

        <div class="space-y-2 pt-4">
          <div class="text-sm text-neutral-300 font-medium">
            Invite New Team Member
          </div>
          <div class="flex items-center gap-2">
            <Input
              placeholder="Name (optional)"
              value={name}
              onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                setName((e.target as HTMLInputElement).value)
              }
            />
            <Input
              placeholder="Email"
              value={email}
              onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                setEmail((e.target as HTMLInputElement).value)
              }
            />
            {/* <Select
              value={role}
              onChange={(e: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
                setRole(
                  (e.target as HTMLSelectElement).value as
                    | 'Owner'
                    | 'Editor'
                    | 'Viewer'
                )
              }
            >
              <option value="Viewer">Viewer</option>
              <option value="Editor">Editor</option>
              <option value="Owner">Owner</option>
            </Select> */}
            <Action
              onClick={() => {
                inviteMember(email, role, name);
                setName('');
                setEmail('');
                //setRole('Viewer');
              }}
            >
              Invite
            </Action>
          </div>
        </div>
      </div>
    </Modal>
  );
}

TeamManagementModal.Modal = (
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
          <TeamManagementModal
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

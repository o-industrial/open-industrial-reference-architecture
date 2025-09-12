import { JSX, WorkspaceManager, IntentTypes, useState, useEffect } from '../../.deps.ts';
import {
  Modal,
  Input,
  Select,
  Action,
  ActionStyleTypes,
  CheckboxRow,
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
    grantDeployAccess,
    removeMember,
    updateMemberRole,
  } = workspaceMgr.UseWorkspaceSettings();

  const [selected, setSelected] = useState<string[]>([]);
  const [bulkRole, setBulkRole] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Owner' | 'Editor' | 'Viewer'>('Viewer');
  const [grantDeploy, setGrantDeploy] = useState(false);

  // Invite/Toast state
  const [inviting, setInviting] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' | 'warning' } | null>(null);

  // Local mirror for instant UI updates
  const [localMembers, setLocalMembers] = useState(teamMembers);
  useEffect(() => setLocalMembers(teamMembers), [teamMembers]);

  const showToast = (message: string, kind: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, kind });
    // auto-hide after 4s
    setTimeout(() => setToast(null), 4000);
  };

  const toggleSelected = (username: string) => {
    setSelected((prev) =>
      prev.includes(username) ? prev.filter((e) => e !== username) : [...prev, username]
    );
  };

  const handleBulkChange = (nextRole: string) => {
    setBulkRole('');
    if (!nextRole) return;
    selected.forEach((username) =>
      updateMemberRole(username, nextRole as 'Owner' | 'Editor' | 'Viewer')
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

  // Basic email validation
  const isValidEmail = (value: string) => {
    const v = value.trim();
    // Simple but effective pattern for typical emails
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  return (
    <>
      <Modal
        title={`Teams: ${currentWorkspace.Details.Name} Members`}
        onClose={onClose}
      >
        <div class="relative">
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

          {/* Column label */}
          <div class="text-xs text-neutral-400 px-1">Email</div>

          <div class="space-y-2 max-h-64 overflow-y-auto">
            {localMembers.map((member) => (
              <div
                class="grid grid-cols-[auto_1fr_1fr_auto_auto_auto] items-center gap-2 border p-2 rounded"
                key={member.Username}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(member.Username)}
                  onChange={() => toggleSelected(member.Username)}
                />
                {/* <div class="text-sm">{member.Name ?? 'N/A'}</div> */}
                <div class="text-sm col-span-3">{member.Username}</div>
                <div class="col-span-2 flex items-center justify-end gap-2">
                {/* <Action
                onClick={() => grantDeployAccess(member.Username)}
                intentType={IntentTypes.Info}
                styleType={ActionStyleTypes.Outline}
              >
                Grant Deploy
              </Action> */}
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
                {/* <div class="text-sm">{friendlyDate(member.Joined)}</div> */}
                <Action
                  onClick={async () => {
                    const username = member.Username;
                    const confirmed = confirm(`Are you sure you want to remove ${username} from this workspace?`);
                    if (!confirmed) return;

                    try {
                      await removeMember(username);
                      setLocalMembers((p) => p.filter((m) => m.Username !== username));
                      showToast(`${username} has been removed`, 'success');
                    } catch (err) {
                      console.error('Remove user failed', err);
                      showToast(`Failed to remove ${username}`, 'error');
                    }
                  }}
                  intentType={IntentTypes.Error}
                  styleType={ActionStyleTypes.Icon}
                >
                  ✖
                </Action>
                </div>
              </div>
            ))}
          </div>

          <div class="space-y-2 pt-4">
            <div class="text-sm text-neutral-300 font-medium">
              Invite New Team Member
            </div>
            <div class="flex items-center gap-2">
              {/* <Input
                placeholder="Name (optional)"
                value={name}
                onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                  setName((e.target as HTMLInputElement).value)
                }
              /> */}
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
                disabled={inviting || !email}
                onClick={async () => {
                  const target = email.trim().toLowerCase();
                  if (!target) return;

                  // Validate email format
                  if (!isValidEmail(target)) {
                    showToast(`"${email}" is not a valid email`, 'warning');
                    return;
                  }

                  // Duplicate check against local view
                  const alreadyMember = localMembers.some(
                    (m) => (m.Username ?? '').toLowerCase() === target
                  );
                  if (alreadyMember) {
                    showToast(`${email} is already a team member`, 'warning');
                    return;
                  }

                  try {
                    setInviting(true);
                    await inviteMember(email, role, name);
                    // Optimistically add to local list for immediate feedback
                    setLocalMembers((prev) => [
                      ...prev,
                      // Minimal shape used by this UI
                      { Username: email } as any,
                    ]);
                    showToast(`Invitation sent to ${email}`, 'success');
                    setName('');
                    setEmail('');
                    // setRole('Viewer');
                  } catch (err) {
                    console.error('Invite failed', err);
                    showToast(`Failed to invite ${email}`, 'error');
                  } finally {
                    setInviting(false);
                  }
                }}
              >
                {inviting ? 'Inviting…' : 'Invite'}
              </Action>
            </div>
          </div>
          </div>
          {/* In-modal toast (sticks to modal bottom) */}
          {toast && (
            <div class="sticky bottom-0 z-10 pt-4 -mb-4">
              <div class="flex justify-center pointer-events-none">
                <div
                  role="status"
                  aria-live="polite"
                  class={`pointer-events-auto rounded-lg px-4 py-3 shadow-lg text-sm font-medium ${
                    toast.kind === 'success'
                      ? 'bg-emerald-600 text-white'
                      : toast.kind === 'warning'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {toast.message}
                  <button class="ml-2 underline" onClick={() => setToast(null)}>
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
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

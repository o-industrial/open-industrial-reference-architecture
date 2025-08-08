import { JSX, WorkspaceManager, useState, IntentTypes } from "../../.deps.ts";
import { Modal, Input, Action, ActionStyleTypes } from "../../.exports.ts";

export type ManageWorkspacesModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function ManageWorkspacesModal({
  workspaceMgr,
  onClose,
}: ManageWorkspacesModalProps): JSX.Element {
  const { currentWorkspace, workspaces, switchToWorkspace } =
    workspaceMgr.UseWorkspaceSettings();

  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [groupAction, setGroupAction] = useState("");

  const toggleSelect = (lookup: string) => {
    setSelected((prev) =>
      prev.includes(lookup)
        ? prev.filter((id) => id !== lookup)
        : [...prev, lookup],
    );
  };

  const handleGroupAction = () => {
    if (!groupAction || selected.length === 0) return;
    alert(`${groupAction} [${selected.join(", ")}] not implemented`);
  };

  const filtered = workspaces.filter((ws) =>
    ws.Details.Name?.toLowerCase().includes(filter.toLowerCase()),
  );

  const active = filtered.filter((ws) => !ws.Archived);
  const archived = filtered.filter((ws) => ws.Archived);

  const formatUpdated = (iso?: string) => {
    if (!iso) return "";
    const diff = Date.now() - Date.parse(iso);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (Number.isNaN(days) || days < 0) return "";
    if (days === 0) return "today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const renderRows = (rows: typeof workspaces) =>
    rows.map((ws) => (
      <tr key={ws.Lookup} class="hover:bg-neutral-800">
        <td class="p-2">
          <input
            type="checkbox"
            checked={selected.includes(ws.Lookup)}
            onChange={() => toggleSelect(ws.Lookup)}
          />
        </td>
        <td
          class="p-2 cursor-pointer"
          onClick={() => switchToWorkspace(ws.Lookup)}
        >
          {ws.Details.Name ?? "Untitled"}
          {ws.Lookup === currentWorkspace.Lookup && " (current)"}
        </td>
        <td class="p-2 text-sm text-neutral-400">
          {ws.Details.Description ?? ""}
        </td>
        <td class="p-2 text-center">{ws.Views ?? 0}</td>
        <td class="p-2 text-center">{ws.Forks ?? 0}</td>
        <td class="p-2 text-sm">
          {formatUpdated(
            ws.UpdatedAt ?? ws.Details.UpdatedAt ?? ws.Details.CreatedAt,
          )}
        </td>
        <td class="p-2">
          <div class="flex gap-2">
            <Action
              styleType={ActionStyleTypes.Link}
              onClick={() => switchToWorkspace(ws.Lookup)}
            >
              Settings
            </Action>
            <Action
              styleType={ActionStyleTypes.Link}
              onClick={() => alert("Fork not implemented")}
            >
              Fork
            </Action>
            <Action
              styleType={ActionStyleTypes.Link}
              onClick={() => alert("Archive not implemented")}
            >
              Archive
            </Action>
            <Action
              styleType={ActionStyleTypes.Link}
              intentType={IntentTypes.Error}
              onClick={() => alert("Delete not implemented")}
            >
              Delete
            </Action>
          </div>
        </td>
      </tr>
    ));

  return (
    <Modal title="Manage Workspaces" onClose={onClose}>
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <Input
            placeholder="Search workspaces..."
            value={filter}
            onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
              setFilter((e.target as HTMLInputElement).value)
            }
          />
          <div class="flex gap-2">
            <select
              class="bg-neutral-900 border border-neutral-700 rounded p-2"
              value={groupAction}
              onChange={(e: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
                setGroupAction((e.target as HTMLSelectElement).value)
              }
            >
              <option value="">Group Action</option>
              <option value="archive">Archive</option>
              <option value="delete">Delete</option>
            </select>
            <Action
              onClick={handleGroupAction}
              disabled={!groupAction || selected.length === 0}
            >
              Apply
            </Action>
          </div>
        </div>

        <section>
          <h3 class="font-semibold mb-2">Workspaces</h3>
          <table class="w-full text-left text-sm">
            <thead>
              <tr>
                <th class="p-2 w-8"></th>
                <th class="p-2">Title</th>
                <th class="p-2">Description</th>
                <th class="p-2 text-center">Views</th>
                <th class="p-2 text-center">Forks</th>
                <th class="p-2">Updated</th>
                <th class="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>{renderRows(active)}</tbody>
          </table>
        </section>

        {archived.length > 0 && (
          <section>
            <h3 class="font-semibold mb-2">Archived Workspaces</h3>
            <table class="w-full text-left text-sm">
              <thead>
                <tr>
                  <th class="p-2 w-8"></th>
                  <th class="p-2">Title</th>
                  <th class="p-2">Description</th>
                  <th class="p-2 text-center">Views</th>
                  <th class="p-2 text-center">Forks</th>
                  <th class="p-2">Updated</th>
                  <th class="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>{renderRows(archived)}</tbody>
            </table>
          </section>
        )}

        <div class="flex justify-end gap-2 pt-4">
          <Action
            onClick={() => alert("Create workspace not implemented")}
            intentType={IntentTypes.Primary}
            styleType={ActionStyleTypes.Outline}
          >
            + Create New Workspace
          </Action>
          <Action onClick={onClose}>Close</Action>
        </div>
      </div>
    </Modal>
  );
}

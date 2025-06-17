import { JSX, WorkspaceManager } from '../.deps.ts';
import { InspectorPanelTemplate } from '../templates/InspectorPanelTemplate.tsx';

type InspectorPanelProps = {
  workspaceMgr: WorkspaceManager;
};

export function InspectorPanel({
  workspaceMgr,
}: InspectorPanelProps): JSX.Element {
  const { selected, inspectorProps } = workspaceMgr.UseInspector();

  const handleClose = () => {
    workspaceMgr.Selection.ClearSelection();
  };

  const renderInspector = () => {
    if (!selected || !inspectorProps) {
      return (
        <div class="text-neutral-500 text-xs italic">
          No node selected. Double click a node to inspect.
        </div>
      );
    }

    const capabilities = workspaceMgr.EaC.GetCapabilities();

    const Inspector = capabilities.GetInspector(selected.id, selected.type!);

    if (!Inspector) {
      return (
        <div class="text-neutral-500 text-xs italic">
          No inspector available for <strong>{selected.type}</strong>.
        </div>
      );
    }

    return <Inspector {...inspectorProps} />;
  };

  return (
    <InspectorPanelTemplate onClose={handleClose}>
      {renderInspector()}
    </InspectorPanelTemplate>
  );
}

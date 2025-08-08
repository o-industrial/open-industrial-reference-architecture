import { NodeEvent, NodeEventRouter } from '../../types/nodes/NodeEventRouter.ts';
import { WorkspaceManager } from '../WorkspaceManager.tsx';

export class SurfaceEventRouter implements NodeEventRouter {
  constructor(protected workspace: WorkspaceManager) {}

  public Handle(event: NodeEvent): void {
    switch (event.Type.toLowerCase()) {
      case 'manage':
        this.workspace.SwitchToScope('surface', event.NodeID);
        break;

      default:
        console.warn(`⚠️ Unknown surface event: ${event.Type}`);
        console.warn(event);
        break;
    }
  }
}

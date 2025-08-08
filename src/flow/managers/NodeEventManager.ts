import { WorkspaceManager } from './WorkspaceManager.tsx';
import { NodeEvent } from '../types/nodes/NodeEventRouter.ts';

export class NodeEventManager {
  constructor(protected workspace: WorkspaceManager) {}

  public Emit(nodeType: string, event: NodeEvent): void {
    console.log(`[NodeEvent] ${event.Type} from ${event.NodeID} of node type ${nodeType}`);

    const router = this.workspace.EaC
      .GetCapabilities()
      .GetEventRouterForType(nodeType, this.workspace);

    if (!router) {
      console.warn(`⚠️ No event router found for node type: ${nodeType}`);
      return;
    }

    router.Handle(event);
  }
}

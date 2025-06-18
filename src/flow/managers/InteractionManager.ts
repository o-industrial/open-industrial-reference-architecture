import { Edge, EdgeChange, Node, NodeChange, XYPosition } from '../.deps.ts';

import { SelectionManager } from './SelectionManager.ts';
import { FlowNodeData } from '../types/react/FlowNodeData.ts';
import { EaCManager } from './EaCManager.ts';

export class InteractionManager {
  protected eacMgr!: EaCManager;

  constructor(private selection: SelectionManager) {}

  public BindEaCManager(eacMgr: EaCManager): void {
    this.eacMgr = eacMgr;
  }

  /**
   * Handles a node drop on the canvas, resolving scope, position,
   * and instantiating the node in the graph and EaC structure.
   */
  public HandleDrop(
    event: DragEvent,
    nodes: Node<FlowNodeData>[],
    screenToFlowPosition: (p: XYPosition) => XYPosition,
  ): { selectedId: string } | null {
    event.preventDefault();

    const type = event.dataTransfer?.getData('application/node-type');

    const capabilities = this.eacMgr.GetCapabilities();

    if (!type || !capabilities.GetPresets()[type]) {
      console.warn(`[Drop] Aborted — unknown or missing node type: ${type}`);
      return null;
    }

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const surfaceParent = nodes.find((node) => {
      if (node.type !== 'surface') return false;
      const style = node.style || {};
      const width = typeof style.width === 'number' ? style.width : 300;
      const height = typeof style.height === 'number' ? style.height : 200;
      return (
        position.x >= node.position.x &&
        position.x <= node.position.x + width &&
        position.y >= node.position.y &&
        position.y <= node.position.y + height
      );
    });

    const relativePosition = surfaceParent
      ? {
        x: position.x - surfaceParent.position.x,
        y: position.y - surfaceParent.position.y,
      }
      : position;

    console.log(`[Drop] Creating node of type: ${type} at`, {
      screen: { x: event.clientX, y: event.clientY },
      flow: position,
      relative: relativePosition,
      parent: surfaceParent?.id,
    });

    const newGraphNode = this.eacMgr.CreateNodeFromPreset(
      type,
      { X: relativePosition.x, Y: relativePosition.y },
      // surfaceParent?.id
    );

    this.selection.SelectNode(newGraphNode.ID);

    return { selectedId: newGraphNode.ID };
  }

  /**
   * Handles a connection action between two nodes.
   * Creates a new edge in the runtime graph via EaCManager.
   */
  public ConnectNodes(source: string, target: string): void {
    console.log(`[Connect] Source: ${source} → Target: ${target}`);
    this.eacMgr.CreateConnectionEdge(source, target);
  }

  /**
   * Applies edge changes from ReactFlow → updates GraphStateManager immediately
   * → debounces propagation to EaC (rebuild relationships).
   */
  public OnEdgesChange(changes: EdgeChange[], currentEdges: Edge[]): void {
    this.eacMgr.ApplyReactFlowEdgeChanges(changes, currentEdges);
  }

  /**
   * Applies node changes from ReactFlow → updates GraphStateManager immediately
   * → debounces propagation to EaC (batch write of positions).
   */
  public OnNodesChange(
    changes: NodeChange[],
    currentNodes: Node<FlowNodeData>[],
  ): void {
    this.eacMgr.ApplyReactFlowNodeChanges(changes, currentNodes);
  }

  public OnNodeDoubleClick(id: string): void {
    console.log('🖱️ [Interaction] double clicked → selecting', id);

    this.selection.SelectNode(id);
  }
}

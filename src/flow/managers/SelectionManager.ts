import { Node } from '../.deps.ts';
import { FlowNodeData } from '../types/react/FlowNodeData.ts';

type SelectionChangedCallback = () => void;

export class SelectionManager {
  protected selectedNodeIds: Set<string> = new Set<string>();
  protected listeners: Set<SelectionChangedCallback> = new Set();

  // === State Access ===

  public GetSelectedNodes(nodes: Node<FlowNodeData>[]): Node<FlowNodeData>[] {
    return nodes.filter((n) => this.selectedNodeIds.has(n.id));
  }

  public GetSelectedNodeIDs(): string[] {
    return Array.from(this.selectedNodeIds);
  }

  public IsSelected(id: string): boolean {
    return this.selectedNodeIds.has(id);
  }

  // === Mutators ===

  public SelectNode(id: string): void {
    this.selectedNodeIds = new Set([id]);
    this.emit();
  }

  public ClearSelection(): void {
    this.selectedNodeIds.clear();
    this.emit();
  }

  // === Listener Management ===

  public OnSelectionChanged(cb: SelectionChangedCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  protected emit(): void {
    for (const cb of this.listeners) cb();
  }
}

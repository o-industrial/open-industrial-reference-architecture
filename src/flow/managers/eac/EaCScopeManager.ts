import {
  applyNodeChanges,
  EaCVertexDetails,
  Edge,
  EdgeChange,
  merge,
  Node,
  NodeChange,
  NullableArrayOrObject,
} from '../../.deps.ts';
import { EverythingAsCodeOIWorkspace } from '../../../eac/EverythingAsCodeOIWorkspace.ts';
import { FlowGraph } from '../../types/graph/FlowGraph.ts';
import { GraphStateManager } from '../GraphStateManager.ts';
import { FlowNodeData } from '../../types/react/FlowNodeData.ts';
import { SimulatorDefinition } from '../SimulatorLibraryManager.ts';

import { EaCNodeCapabilityContext } from '../../types/nodes/EaCNodeCapabilityContext.ts';
import { EaCNodeCapabilityPatch } from '../../types/nodes/EaCNodeCapabilityPatch.ts';
import { EaCCapabilitiesManager } from './EaCCapabilitiesManager.ts';
import { FlowGraphNode } from '../../types/graph/FlowGraphNode.ts';
import { EaCNodeCapabilityAsCode } from '../../.exports.ts';
import { Position } from '../../../eac/.exports.ts';
import { EaCFlowNodeMetadata } from '../../../eac/EaCFlowNodeMetadata.ts';

/**
 * Abstract base for scoped EaC logic (workspace, surface, etc.).
 */
export abstract class EaCScopeManager {
  constructor(
    protected graph: GraphStateManager,
    protected capabilities: EaCCapabilitiesManager,
    protected getEaC: () => EverythingAsCodeOIWorkspace,
  ) {}

  public abstract BuildGraph(): FlowGraph;

  public BuildPartialForNodeUpdate(
    id: string,
    patch: EaCNodeCapabilityPatch,
  ): Partial<EverythingAsCodeOIWorkspace> | null {
    const node = this.findNode(id);
    if (!node) return null;

    return this.capabilities.BuildUpdatePatch(
      node,
      patch,
      this.getCapabilityContext(),
    );
  }

  public BuildPartialForNodeDelete(
    id: string,
  ): NullableArrayOrObject<EverythingAsCodeOIWorkspace> | null {
    const node = this.findNode(id);
    if (!node) return null;

    return this.capabilities.BuildDeletePatch(
      node,
      this.getCapabilityContext(),
    );
  }

  public abstract CreateConnectionEdge(
    source: string,
    target: string,
  ): Partial<EverythingAsCodeOIWorkspace> | null;

  public CreatePartialEaCFromPreset(
    type: string,
    id: string,
    position: Position,
  ): Partial<EverythingAsCodeOIWorkspace> {
    return (
      this.capabilities.BuildPresetPatch(
        type,
        id,
        position,
        this.getCapabilityContext(),
      ) ?? {}
    );
  }

  public GetCapabilities(): EaCCapabilitiesManager {
    return this.capabilities;
  }

  public GetNodeAsCode(id: string): {
    Metadata?: EaCFlowNodeMetadata;
    Details: EaCVertexDetails;
  } | null {
    const node = this.findNode(id);
    if (!node) return null;

    return this.capabilities.GetAsCode(node, this.getCapabilityContext());
  }

  /**
   * Retrieves live or mock stats for a given node ID by delegating to its capability manager.
   * Used by inspector panels and UI components to show node-specific metrics.
   */
  public async GetStats(id: string): Promise<Record<string, unknown>> {
    const node = this.findNode(id);
    if (!node) throw new Error(`Cannot find node with ID: ${id}`);

    return await this.capabilities.GetStats(node, this.getCapabilityContext());
  }

  public abstract HasConnection(source: string, target: string): boolean;

  public InstallSimulators(
    _simDefs: SimulatorDefinition[],
  ): Partial<EverythingAsCodeOIWorkspace> {
    throw new Deno.errors.NotSupported(
      `InstallSimulators is not supported in scope ${this.constructor.name}`,
    );
  }

  public RemoveConnectionEdge(
    edgeId: string,
  ): Partial<EverythingAsCodeOIWorkspace> | null {
    const [sourceId, targetId] = edgeId.split('->');

    const src = this.findNode(sourceId);
    const tgt = this.findNode(targetId);

    if (!src || !tgt) return null;

    return this.capabilities.BuildDisconnectionPatch(
      src,
      tgt,
      this.getCapabilityContext(),
    );
  }

  public abstract UpdateConnections(
    changes: EdgeChange[],
    edges: Edge[],
  ): EverythingAsCodeOIWorkspace | null;

  public UpdateNodesFromChanges(
    changes: NodeChange[],
    currentNodes: Node<FlowNodeData>[],
  ): Partial<EverythingAsCodeOIWorkspace> | null {
    const updated = applyNodeChanges(changes, currentNodes);

    let partial: Partial<EverythingAsCodeOIWorkspace> = {};
    let modified = false;

    for (const node of updated) {
      const pos = { X: node.position.x, Y: node.position.y };
      const asCode = this.findAsCode(node);
      if (!asCode) continue;

      const prev = asCode.Metadata?.Position;
      const changed = !prev || prev.X !== pos.X || prev.Y !== pos.Y;
      if (!changed) continue;

      const patch: EaCNodeCapabilityPatch = {
        Metadata: { ...asCode.Metadata, Position: pos },
      };

      const graphNode = this.findNode(node.id);
      if (!graphNode) return null;

      const update = this.capabilities.BuildUpdatePatch(
        graphNode,
        patch,
        this.getCapabilityContext(),
      );
      if (!update) continue;

      partial = merge(partial, update);
      modified = true;
    }

    return modified ? partial : null;
  }

  public UpdateNodePatch(
    id: string,
    patch: Partial<{
      Details: EaCVertexDetails;
      Metadata: Partial<EaCFlowNodeMetadata>;
    }>,
  ): Partial<EverythingAsCodeOIWorkspace> | null {
    const current = this.GetNodeAsCode(id);
    if (!current) return null;

    const merged: Partial<{
      Details: EaCVertexDetails;
      Metadata: EaCFlowNodeMetadata;
    }> = {};

    if (patch.Details) {
      const combined = { ...current.Details, ...patch.Details };

      if (JSON.stringify(current.Details) !== JSON.stringify(combined)) {
        merged.Details = combined;
      }
    }

    if (patch.Metadata) {
      const prevMeta = current.Metadata ?? {};
      const combined = merge<EaCFlowNodeMetadata>(prevMeta, patch.Metadata);

      if (JSON.stringify(prevMeta) !== JSON.stringify(combined)) {
        merged.Metadata = combined;
      }
    }

    if (Object.keys(merged).length === 0) return null;

    return this.BuildPartialForNodeUpdate(id, merged);
  }

  protected findAsCode(
    node: Node<FlowNodeData>,
  ): EaCNodeCapabilityAsCode | null {
    const graphNode = this.findNode(node.id)!;
    if (!node) return null;

    return this.capabilities.GetAsCode(graphNode, this.getCapabilityContext());
  }

  protected findNode(id: string): FlowGraphNode | undefined {
    return this.graph.GetGraph().Nodes.find((n) => n.ID === id);
  }

  protected getCapabilityContext(): EaCNodeCapabilityContext {
    return {
      GetEaC: this.getEaC,
    };
  }
}

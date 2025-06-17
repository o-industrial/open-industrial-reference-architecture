import { Edge, EdgeChange } from '../../.deps.ts';
import { EaCScopeManager } from './EaCScopeManager.ts';
import { GraphStateManager } from '../GraphStateManager.ts';

import { OpenIndustrialEaC } from '../../../types/OpenIndustrialEaC.ts';
import { FlowGraph } from '../../types/graph/FlowGraph.ts';
import { FlowGraphNode } from '../../types/graph/FlowGraphNode.ts';
import { FlowGraphEdge } from '../../types/graph/FlowGraphEdge.ts';
import { EaCNodeCapabilityContext } from '../../types/nodes/EaCNodeCapabilityContext.ts';
import { EaCCapabilitiesManager } from './EaCCapabilitiesManager.ts';

export class EaCSurfaceScopeManager extends EaCScopeManager {
  constructor(
    graph: GraphStateManager,
    capabilities: EaCCapabilitiesManager,
    getEaC: () => OpenIndustrialEaC,
    protected surfaceLookup: string,
  ) {
    super(graph, capabilities, getEaC);
  }

  public BuildGraph(): FlowGraph {
    const ctx = this.getCapabilityContext();

    const nodes: FlowGraphNode[] = [];
    const edges: FlowGraphEdge[] = [];

    const surface = this.getEaC().Surfaces?.[this.surfaceLookup];
    if (!surface) return { Nodes: [], Edges: [] };

    for (const schemaKey of Object.keys(surface.Schemas ?? {})) {
      const node = this.capabilities.BuildNode(schemaKey, 'schema', ctx);
      if (node) {
        nodes.push(node);
        edges.push(...this.capabilities.BuildEdgesForNode(node, ctx));
      }
    }

    for (const agentKey of Object.keys(surface.Agents ?? {})) {
      const node = this.capabilities.BuildNode(agentKey, 'agent', ctx);
      if (node) {
        nodes.push(node);
        edges.push(...this.capabilities.BuildEdgesForNode(node, ctx));
      }
    }

    for (const connKey of Object.keys(surface.DataConnections ?? {})) {
      const node = this.capabilities.BuildNode(
        `${this.surfaceLookup}->${connKey}`,
        'surface->connection',
        ctx,
      );
      if (node) {
        nodes.push(node);
        edges.push(...this.capabilities.BuildEdgesForNode(node, ctx));
      }
    }

    // // Child surfaces
    // for (const [key, child] of Object.entries(
    //   (eac as EverythingAsCodeOIWorkspace).Surfaces ?? {}
    // )) {
    //   if (child.ParentSurfaceLookup !== this.surfaceLookup) continue;

    //   nodes.push({
    //     ID: key,
    //     Type: 'surface',
    //     Label: child.Details?.Name ?? key,
    //     Metadata: child.Metadata,
    //     Details: child.Details,
    //   });
    // }

    return { Nodes: nodes, Edges: edges };
  }

  public CreateConnectionEdge(
    source: string,
    target: string,
  ): Partial<OpenIndustrialEaC> | null {
    const src = this.findNode(source);
    const tgt = this.findNode(target);

    if (!src || !tgt) return null;

    return this.capabilities.BuildConnectionPatch(
      src,
      tgt,
      this.getCapabilityContext(),
    );
  }

  public HasConnection(source: string, target: string): boolean {
    return this.graph
      .GetGraph()
      .Edges.some((e) => e.Source === source && e.Target === target);
  }

  public UpdateConnections(
    _changes: EdgeChange[],
    _edges: Edge[],
  ): OpenIndustrialEaC | null {
    // let changed = false;
    // const partial: OpenIndustrialEaC = {};

    // for (const change of changes) {
    //   if (change.type === 'add') {
    //     const edge = edges.find((e) => e.id === change.item.id);
    //     if (!edge) continue;

    //     const update = this.CreateConnectionEdge(eac, edge.source, edge.target);
    //     if (update) {
    //       merge(partial, update);
    //       changed = true;
    //     }
    //   }

    //   if (change.type === 'remove') {
    //     const update = this.RemoveConnectionEdge(eac, change.id);
    //     if (update) {
    //       merge(partial, update);
    //       changed = true;
    //     }
    //   }
    // }

    // return changed ? partial : null;

    return null;
  }

  protected override getCapabilityContext(): EaCNodeCapabilityContext {
    const ctx = super.getCapabilityContext();

    return {
      ...ctx,
      SurfaceLookup: this.surfaceLookup,
    };
  }
}

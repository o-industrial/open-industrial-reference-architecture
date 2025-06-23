import { Edge, EdgeChange } from '../../.deps.ts';
import { EaCScopeManager } from './EaCScopeManager.ts';
import { FlowGraph } from '../../types/graph/FlowGraph.ts';
import { FlowGraphEdge } from '../../types/graph/FlowGraphEdge.ts';
import { FlowGraphNode } from '../../types/graph/FlowGraphNode.ts';

import { EverythingAsCodeOIWorkspace } from '../../../eac/EverythingAsCodeOIWorkspace.ts';
import { SimulatorDefinition } from '../SimulatorLibraryManager.ts';
import { EaCAzureDockerSimulatorDetails } from '../../../eac/EaCAzureDockerSimulatorDetails.ts';

export class EaCWorkspaceScopeManager extends EaCScopeManager {
  public BuildGraph(): FlowGraph {
    const ctx = this.getCapabilityContext();

    const wks = this.getEaC();
    const nodes: FlowGraphNode[] = [];
    const edges: FlowGraphEdge[] = [];

    // --- DataConnections
    for (const key of Object.keys(wks.DataConnections ?? {})) {
      const node = this.capabilities.BuildNode(key, 'connection', ctx);
      if (node) {
        nodes.push(node);
        edges.push(...this.capabilities.BuildEdgesForNode(node, ctx));
      }
    }

    // --- Simulators
    for (const key of Object.keys(wks.Simulators ?? {})) {
      const node = this.capabilities.BuildNode(key, 'simulator', ctx);
      if (node) {
        nodes.push(node);
        edges.push(...this.capabilities.BuildEdgesForNode(node, ctx));
      }
    }

    // --- Root-level Surfaces
    for (const [key, surf] of Object.entries(wks.Surfaces ?? {})) {
      if (surf.ParentSurfaceLookup) continue;

      const node = this.capabilities.BuildNode(key, 'surface', ctx);
      if (node) {
        nodes.push(node);
        edges.push(...this.capabilities.BuildEdgesForNode(node, ctx));
      }
    }

    return { Nodes: nodes, Edges: edges };
  }

  public CreateConnectionEdge(
    source: string,
    target: string,
  ): Partial<EverythingAsCodeOIWorkspace> | null {
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

  public override InstallSimulators(
    simDefs: SimulatorDefinition[],
  ): Partial<EverythingAsCodeOIWorkspace> {
    const partial: Partial<EverythingAsCodeOIWorkspace> = { Simulators: {} };

    for (const sim of simDefs) {
      partial.Simulators![sim.ID] = {
        Details: {
          Type: 'AzureDocker',
          Name: sim.Label,
          Description: sim.Description,
        } as EaCAzureDockerSimulatorDetails,
      };
    }

    return partial;
  }

  public UpdateConnections(
    _changes: EdgeChange[],
    _updated: Edge[],
  ): EverythingAsCodeOIWorkspace | null {
    return null;
  }
}

import {
  ComponentType,
  EaCAzureDockerSimulatorDetails,
  EaCFlowNodeMetadata,
  EaCNodeCapabilityAsCode,
  EaCNodeCapabilityContext,
  EaCNodeCapabilityManager,
  EaCNodeCapabilityPatch,
  EaCSimulatorAsCode,
  EverythingAsCodeOIWorkspace,
  FlowGraphEdge,
  FlowGraphNode,
  FunctionComponent,
  memo,
  NullableArrayOrObject,
  OpenIndustrialEaC,
  Position,
} from '../../.deps.ts';
import { SimulatorInspector } from './SimulatorInspector.tsx';
import SimulatorNodeRenderer from './SimulatorNodeRenderer.tsx';
import { SimulatorStats } from './SimulatorStats.tsx';

/**
 * Capability manager for workspace-scoped Simulators.
 * Responsible for projecting simulator nodes, simulates edges,
 * and binding connections via SimulatorLookup.
 */
export class SimulatorNodeCapabilityManager extends EaCNodeCapabilityManager<EaCAzureDockerSimulatorDetails> {
  protected static renderer: ComponentType = memo(
    SimulatorNodeRenderer as FunctionComponent
  );

  public override Type = 'simulator';

  protected override buildAsCode(
    node: FlowGraphNode,
    ctx: EaCNodeCapabilityContext
  ): EaCNodeCapabilityAsCode<EaCAzureDockerSimulatorDetails> | null {
    const sim = ctx.GetEaC().Simulators?.[node.ID];
    if (!sim) return null;

    return {
      Metadata: sim.Metadata,
      Details: (sim.Details ?? {}) as EaCAzureDockerSimulatorDetails,
    };
  }

  protected override buildConnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    ctx: EaCNodeCapabilityContext
  ): Partial<OpenIndustrialEaC> | null {
    if (source.Type !== 'simulator' || target.Type !== 'connection') {
      return null;
    }

    const eac = ctx.GetEaC() as EverythingAsCodeOIWorkspace;
    const existing = eac.DataConnections?.[target.ID]?.SimulatorLookup;

    if (existing === source.ID) return null;

    return {
      DataConnections: {
        [target.ID]: {
          ...eac.DataConnections?.[target.ID],
          SimulatorLookup: source.ID,
        },
      },
    };
  }

  protected override buildDeletePatch(
    node: FlowGraphNode
  ): NullableArrayOrObject<OpenIndustrialEaC> {
    return this.wrapDeletePatch('Simulators', node.ID);
  }

  protected override buildDisconnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    ctx: EaCNodeCapabilityContext
  ): Partial<OpenIndustrialEaC> | null {
    if (source.Type !== 'simulator' || target.Type !== 'connection') {
      return null;
    }

    const eac = ctx.GetEaC() as EverythingAsCodeOIWorkspace;
    const conn = eac.DataConnections?.[target.ID];

    if (!conn || conn.SimulatorLookup !== source.ID) return null;

    return {
      DataConnections: {
        [target.ID]: {
          ...conn,
          SimulatorLookup: undefined,
        },
      },
    };
  }

  protected override buildEdgesForNode(
    node: FlowGraphNode,
    ctx: EaCNodeCapabilityContext
  ): FlowGraphEdge[] {
    const eac = ctx.GetEaC() as EverythingAsCodeOIWorkspace;

    const edges: FlowGraphEdge[] = [];

    for (const [connKey, conn] of Object.entries(eac.DataConnections ?? {})) {
      if (conn.SimulatorLookup === node.ID) {
        edges.push({
          ID: `${node.ID}->${connKey}`,
          Source: node.ID,
          Target: connKey,
          Label: 'simulates',
        });
      }
    }

    return edges;
  }

  protected override buildNode(
    id: string,
    ctx: EaCNodeCapabilityContext
  ): FlowGraphNode | null {
    const sim = ctx.GetEaC().Simulators?.[id];
    if (!sim) return null;

    return {
      ID: id,
      Type: this.Type,
      Label: sim.Details?.Name ?? id,
      Metadata: sim.Metadata,
      Details: sim.Details,
    };
  }

  protected override buildPresetPatch(
    id: string,
    position: Position,
    _context: EaCNodeCapabilityContext
  ): Partial<OpenIndustrialEaC> {
    const metadata: EaCFlowNodeMetadata = {
      Position: position,
      Enabled: true,
    };

    const details = { Name: id };

    return {
      Simulators: {
        [id]: {
          Metadata: metadata,
          Details: details,
        } as EaCSimulatorAsCode,
      },
    };
  }

  protected override buildUpdatePatch(
    node: FlowGraphNode,
    update: EaCNodeCapabilityPatch<EaCAzureDockerSimulatorDetails>
  ): Partial<OpenIndustrialEaC> {
    return {
      Simulators: {
        [node.ID]: this.mergeDetailsAndMetadata(
          update.Details,
          update.Metadata
        ),
      },
    };
  }

  protected override getInspector() {
    return SimulatorInspector;
  }

  protected override getRenderer() {
    return SimulatorNodeCapabilityManager.renderer;
  }

  protected override async getStats(
    type: string,
    id: string,
    context: EaCNodeCapabilityContext
  ): Promise<SimulatorStats> {
    const stats = await super.getStats(type, id, context);

    return {
      ...stats,
      instanceCount: Math.floor(Math.random() * 10) + 1,
      avgStartupMs: Number((Math.random() * 2 + 1).toFixed(2)),
      lastDeploymentAt: new Date(Date.now()).toISOString(),
    };
  }
}

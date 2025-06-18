import {
  ComponentType,
  EaCAgentDetails,
  EaCFlowNodeMetadata,
  EaCNodeCapabilityAsCode,
  EaCNodeCapabilityContext,
  EaCNodeCapabilityManager,
  EaCNodeCapabilityPatch,
  FlowGraphEdge,
  FlowGraphNode,
  FunctionComponent,
  memo,
  NullableArrayOrObject,
  OpenIndustrialEaC,
  Position,
  SurfaceAgentSettings,
} from '../../.deps.ts';
import { SurfaceAgentInspector } from './SurfaceAgentInspector.tsx';
import SurfaceAgentNodeRenderer from './SurfaceAgentNodeRenderer.tsx';
import { SurfaceAgentStats } from './SurfaceAgentStats.tsx';

// ✅ Compound node detail type
type SurfaceAgentNodeDetails = EaCAgentDetails & SurfaceAgentSettings;

export class SurfaceAgentNodeCapabilityManager extends EaCNodeCapabilityManager<SurfaceAgentNodeDetails> {
  protected static renderer: ComponentType = memo(
    SurfaceAgentNodeRenderer as FunctionComponent
  );

  public override Type = 'agent';

  protected override buildAsCode(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext
  ): EaCNodeCapabilityAsCode<SurfaceAgentNodeDetails> | null {
    const agentId = node.ID;

    const eac = context.GetEaC();

    const agentAsCode = eac.Agents?.[agentId];
    const surfaceSettings =
      eac.Surfaces?.[context.SurfaceLookup!]?.Agents?.[agentId];

    if (!agentAsCode || !surfaceSettings) return null;

    const { Metadata, ...surfaceOverrides } = surfaceSettings;

    return {
      Metadata,
      Details: {
        ...agentAsCode.Details,
        ...surfaceOverrides,
      } as SurfaceAgentNodeDetails,
    };
  }

  protected override buildConnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    context: EaCNodeCapabilityContext
  ): Partial<OpenIndustrialEaC> | null {
    if (source.Type === 'agent' && target.Type?.includes('schema')) {
      const eac = context.GetEaC();
      const agent = eac.Agents?.[source.ID];
      if (!agent) return null;

      return {
        Agents: {
          [source.ID]: {
            ...agent,
            Schema: {
              SchemaLookup: target.ID,
            },
          },
        },
      };
    }

    return null;
  }

  protected override buildDisconnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    context: EaCNodeCapabilityContext
  ): Partial<OpenIndustrialEaC> | null {
    if (source.Type !== 'agent' || !target.Type?.includes('schema')) {
      return null;
    }

    const eac = context.GetEaC();
    const agent = eac.Agents?.[source.ID];

    if (!agent || agent.Schema?.SchemaLookup !== target.ID) return null;

    const { Schema: _, ...rest } = agent;

    return {
      Agents: {
        [source.ID]: rest,
      },
    };
  }

  protected override buildDeletePatch(
    node: FlowGraphNode
  ): NullableArrayOrObject<OpenIndustrialEaC> {
    const [surfaceId, agentId] = this.extractCompoundIDs(node);

    return {
      Surfaces: {
        [surfaceId]: {
          Agents: {
            [agentId]: null,
          },
        },
      },
    } as unknown as NullableArrayOrObject<OpenIndustrialEaC>;
  }

  protected override buildEdgesForNode(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext
  ): FlowGraphEdge[] {
    const eac = context.GetEaC();
    const agentId = node.ID;
    const agent = eac.Agents?.[agentId];

    const edges: FlowGraphEdge[] = [];

    const targetSchema = agent?.Schema?.SchemaLookup;

    if (targetSchema) {
      edges.push({
        ID: `${targetSchema}->${agentId}`,
        Source: targetSchema,
        Target: agentId,
        Label: 'targets',
      });
    }

    return edges;
  }

  protected override buildNode(
    id: string,
    context: EaCNodeCapabilityContext
  ): FlowGraphNode | null {
    const surfaceId = context.SurfaceLookup!;
    const agentId = id;

    const eac = context.GetEaC();
    const surface = eac.Surfaces?.[surfaceId];
    const settings = surface?.Agents?.[agentId];
    const agent = eac.Agents?.[agentId];

    if (!agent || !settings || settings.Metadata?.Enabled === false) {
      return null;
    }

    const { Metadata, ...rest } = settings;

    return {
      ID: agentId,
      Type: this.Type,
      Label: agent.Details?.Name ?? agentId,
      Metadata: {
        ...(agent.Metadata ?? {}),
        ...Metadata,
      },
      Details: {
        ...agent.Details,
        ...rest,
      },
    };
  }

  protected override buildPresetPatch(
    id: string,
    position: Position,
    context: EaCNodeCapabilityContext
  ): Partial<OpenIndustrialEaC> {
    const metadata: EaCFlowNodeMetadata = {
      Position: position,
      Enabled: true,
    };

    const details = { Name: id };

    return {
      Agents: {
        [id]: {
          Metadata: metadata,
          Details: details,
        },
      },
      ...(context.SurfaceLookup
        ? {
            Surfaces: {
              [context.SurfaceLookup]: {
                Agents: {
                  [id]: {
                    ShowHistory: false,
                    Metadata: metadata,
                  },
                },
              },
            },
          }
        : {}),
    };
  }

  protected override buildUpdatePatch(
    node: FlowGraphNode,
    update: EaCNodeCapabilityPatch<SurfaceAgentNodeDetails>,
    context: EaCNodeCapabilityContext
  ): Partial<OpenIndustrialEaC> {
    const agentId = node.ID;

    const settings: SurfaceAgentSettings = {
      ...(update.Metadata ? { Metadata: update.Metadata } : {}),
    };

    const { ShowHistory: _, ...rest } = update.Details ?? {};
    const agentDetails: Partial<EaCAgentDetails> = rest;

    const patch: Partial<OpenIndustrialEaC> = {};

    if (Object.keys(settings).length > 0) {
      patch.Surfaces = {
        [context.SurfaceLookup!]: {
          Agents: {
            [agentId]: settings,
          },
        },
      };
    }

    if (Object.keys(agentDetails).length > 0) {
      patch.Agents = {
        [agentId]: {
          Details: agentDetails as EaCAgentDetails,
        },
      };
    }

    return patch;
  }

  protected override getInspector() {
    return SurfaceAgentInspector;
  }

  protected override getPreset() {
    return { Type: this.Type, Label: 'Agent', IconKey: 'agent' };
  }

  protected override getRenderer() {
    return SurfaceAgentNodeCapabilityManager.renderer;
  }

  protected override async getStats(
    type: string,
    id: string,
    context: EaCNodeCapabilityContext
  ): Promise<SurfaceAgentStats> {
    const stats = await super.getStats(type, id, context);

    return {
      ...stats,
      matchesHandled: Math.floor(Math.random() * 200),
      avgLatencyMs: Number((Math.random() * 40 + 10).toFixed(1)),
      lastRunAgo: `${Math.floor(Math.random() * 90)}s ago`,
    };
  }
}

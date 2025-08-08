import { Position } from '../../../../eac/.exports.ts';
import { EaCFlowNodeMetadata } from '../../../../eac/EaCFlowNodeMetadata.ts';
import {
  EaCNodeCapabilityAsCode,
  EaCNodeCapabilityContext,
  EaCNodeCapabilityManager,
  EaCNodeCapabilityPatch,
  FlowGraphEdge,
  FlowGraphNode,
} from '../../../../flow/.exports.ts';
import { EaCWarmQueryDetails } from '../../../../eac/.deps.ts';
import { SurfaceWarmQuerySettings } from '../../../../eac/.exports.ts';
import { SurfaceWarmQueryInspector } from './SurfaceWarmQueryInspector.tsx';
import { ComponentType, FunctionComponent, memo, NullableArrayOrObject } from '../../.deps.ts';
import SurfaceWarmQueryNodeRenderer from './SurfaceWarmQueryNodeRenderer.tsx';
import { SurfaceWarmQueryStats } from './SurfaceWarmQueryStats.tsx';
import { EverythingAsCodeOIWorkspace } from '../../../../eac/EverythingAsCodeOIWorkspace.ts';

// ✅ Compound node detail type
type SurfaceWarmQueryNodeDetails = EaCWarmQueryDetails & SurfaceWarmQuerySettings;

export class SurfaceWarmQueryNodeCapabilityManager
  extends EaCNodeCapabilityManager<SurfaceWarmQueryNodeDetails> {
  protected static renderer: ComponentType = memo(
    SurfaceWarmQueryNodeRenderer as FunctionComponent,
  );

  public override Type = 'warmquery';

  protected override buildAsCode(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): EaCNodeCapabilityAsCode<SurfaceWarmQueryNodeDetails> | null {
    const wqId = node.ID;

    const eac = context.GetEaC();

    const wqAsCode = eac.WarmQueries?.[wqId];
    const surfaceSettings = eac.Surfaces?.[context.SurfaceLookup!]?.WarmQueries?.[wqId];

    if (!wqAsCode || !surfaceSettings) return null;

    const { Metadata, ...surfaceOverrides } = surfaceSettings;

    return {
      Metadata,
      Details: {
        ...wqAsCode.Details,
        ...surfaceOverrides,
      } as SurfaceWarmQueryNodeDetails,
    };
  }

  protected override buildConnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> | null {
    const surfaceId = context.SurfaceLookup as string;
    const wqId = target.ID;
    const eac = context.GetEaC();
    const wq = eac.WarmQueries?.[wqId];
    if (!wq) return null;
    const surface = eac.Surfaces?.[surfaceId];

    if (source.Type.includes('schema') && target.Type.includes('warmquery')) {
      return {
        Surfaces: {
          [surfaceId]: {
            ...surface,
            WarmQueries: {
              [wqId]: {
                ...surface?.WarmQueries?.[wqId],
                SchemaLookups: [
                  ...(surface?.WarmQueries?.[wqId]?.SchemaLookups ?? []),
                  source.ID,
                ],
              },
            },
          },
        },
      };
    } else if (source.Type.includes('connection') && target.Type.includes('warmquery')) {
      return {
        Surfaces: {
          [surfaceId]: {
            ...surface,
            WarmQueries: {
              [wqId]: {
                ...surface?.WarmQueries?.[wqId],
                DataConnectionLookups: [
                  ...(surface?.WarmQueries?.[wqId]?.DataConnectionLookups ?? []),
                  source.ID,
                ],
              },
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
    context: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> | null {
    if (
      !target.Type.includes('warmquery') ||
      !(source.Type.includes('schema') || source.Type.includes('connection'))
    ) {
      return null;
    }

    const surfaceId = context.SurfaceLookup as string;
    const wqId = target.ID;
    const eac = context.GetEaC();
    const wq = eac.WarmQueries?.[wqId];
    if (!wq) return null;
    const surface = eac.Surfaces?.[surfaceId];
    const wqSettings = surface?.WarmQueries?.[wqId];

    if (source.Type.includes('schema')) {
      if (
        !wqSettings || !wqSettings.SchemaLookups || wqSettings.SchemaLookups.length === 0 ||
        !wqSettings.SchemaLookups.includes(source.ID)
      ) return null;

      const filtered = (wqSettings.SchemaLookups as string[]).filter(
        (item) => item !== source.ID,
      );

      return {
        Surfaces: {
          [surfaceId]: {
            ...surface,
            WarmQueries: {
              [wqId]: {
                ...surface?.WarmQueries?.[wqId],
                SchemaLookups: filtered,
              },
            },
          },
        },
      };
    } else if (source.Type.includes('connection')) {
      if (
        !wqSettings || !wqSettings.DataConnectionLookups ||
        wqSettings.DataConnectionLookups.length === 0 ||
        !wqSettings.DataConnectionLookups.includes(source.ID)
      ) return null;

      const filtered = (wqSettings.DataConnectionLookups as string[]).filter((item) =>
        item !== source.ID
      );

      return {
        Surfaces: {
          [surfaceId]: {
            ...surface,
            WarmQueries: {
              [wqId]: {
                ...surface?.WarmQueries?.[wqId],
                DataConnectionLookups: filtered,
              },
            },
          },
        },
      };
    }
    return null;
  }

  protected override buildDeletePatch(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): NullableArrayOrObject<EverythingAsCodeOIWorkspace> {
    const wqId = node.ID;
    const surfaceId = context.SurfaceLookup!;
    const eac = context.GetEaC();
    const surface = eac.Surfaces?.[surfaceId];

    return {
      Surfaces: {
        [surfaceId]: {
          ...surface,
          WarmQueries: {
            [wqId]: null,
          },
        },
      },
      WarmQueries: {
        [wqId]: null,
      },
    } as unknown as NullableArrayOrObject<EverythingAsCodeOIWorkspace>;
  }

  protected override buildEdgesForNode(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): FlowGraphEdge[] {
    const eac = context.GetEaC();
    const wqId = node.ID;
    const surface = eac.Surfaces?.[context.SurfaceLookup!];

    const edges: FlowGraphEdge[] = [];

    const targetSchemas = surface?.WarmQueries?.[wqId]?.SchemaLookups;

    if (targetSchemas) {
      targetSchemas.forEach((targetSchema: string) => {
        edges.push({
          ID: `${targetSchema}->${wqId}`,
          Source: targetSchema,
          Target: wqId,
          Label: 'targets',
        });
      });
    }

    const targetConnections = surface?.WarmQueries?.[wqId]?.DataConnectionLookups;

    if (targetConnections) {
      targetConnections.forEach((targetConnection: string) => {
        edges.push({
          ID: `${targetConnection}->${wqId}`,
          Source: targetConnection,
          Target: wqId,
          Label: 'queries',
        });
      });
    }

    return edges;
  }

  protected override buildNode(
    id: string,
    context: EaCNodeCapabilityContext,
  ): FlowGraphNode | null {
    const surfaceId = context.SurfaceLookup!;
    const wqId = id;

    const eac = context.GetEaC();
    const surface = eac.Surfaces?.[surfaceId];
    const settings = surface?.WarmQueries?.[wqId];
    const wq = eac.WarmQueries?.[wqId];

    if (!wq || !settings || settings.Metadata?.Enabled === false) {
      return null;
    }

    const { Metadata, ...rest } = settings;

    return {
      ID: wqId,
      Type: this.Type,
      Label: wq.Details?.Name ?? wqId,
      Metadata: {
        ...(wq.Metadata ?? {}),
        ...Metadata,
      },
      Details: {
        ...wq.Details,
        ...rest,
      },
    };
  }

  protected override buildPresetPatch(
    id: string,
    position: Position,
    context: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> {
    const metadata: EaCFlowNodeMetadata = {
      Position: position,
      Enabled: true,
    };

    const details = { Name: id, ApiPath: id };

    return {
      WarmQueries: {
        [id]: {
          Metadata: metadata,
          Details: details,
        },
      },
      ...(context.SurfaceLookup
        ? {
          Surfaces: {
            [context.SurfaceLookup]: {
              WarmQueries: {
                [id]: {
                  SchemaLookups: [] as string[],
                  DataConnectionLookups: [] as string[],
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
    update: EaCNodeCapabilityPatch<SurfaceWarmQueryNodeDetails>,
    context: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> {
    const wqId = node.ID;

    const settings: SurfaceWarmQuerySettings = {
      ...(update.Metadata ? { Metadata: update.Metadata } : {}),
    };

    const { SchemaLookups: _, DataConnectionLookups: __, ...rest } = update.Details ?? {};
    const wqDetails: Partial<EaCWarmQueryDetails> = rest;

    const patch: Partial<EverythingAsCodeOIWorkspace> = {};

    if (Object.keys(settings).length > 0) {
      patch.Surfaces = {
        [context.SurfaceLookup!]: {
          WarmQueries: {
            [wqId]: settings,
          },
        },
      };
    }

    if (Object.keys(wqDetails).length > 0) {
      patch.WarmQueries = {
        [wqId]: {
          Details: wqDetails as EaCWarmQueryDetails,
        },
      };
    }

    return patch;
  }

  protected override getInspector() {
    return SurfaceWarmQueryInspector;
  }

  protected override getPreset() {
    return { Type: this.Type, Label: 'Warm Query', IconKey: 'warmQuery' };
  }

  protected override getRenderer() {
    return SurfaceWarmQueryNodeCapabilityManager.renderer;
  }

  protected override async getStats(
    type: string,
    id: string,
    context: EaCNodeCapabilityContext,
  ): Promise<SurfaceWarmQueryStats> {
    const stats = await super.getStats(type, id, context);

    return {
      ...stats,
      matchesHandled: Math.floor(Math.random() * 200),
      avgLatencyMs: Number((Math.random() * 40 + 10).toFixed(1)),
      lastRunAgo: `${Math.floor(Math.random() * 90)}s ago`,
    };
  }
}

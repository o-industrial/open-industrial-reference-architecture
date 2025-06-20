import { SurfaceDataConnectionSettings } from '../../../../eac/EaCSurfaceAsCode.ts';
import { EverythingAsCodeOIWorkspace } from '../../../../eac/EverythingAsCodeOIWorkspace.ts';
import {
  EaCNodeCapabilityAsCode,
  EaCNodeCapabilityContext,
  EaCNodeCapabilityManager,
  EaCNodeCapabilityPatch,
  FlowGraphEdge,
  FlowGraphNode,
} from '../../../../flow/.exports.ts';
import { OpenIndustrialEaC } from '../../../../types/OpenIndustrialEaC.ts';
import { ComponentType, FunctionComponent, memo, NullableArrayOrObject } from '../../.deps.ts';
import { SurfaceConnectionInspector } from './SurfaceConnectionInspector.tsx';
import SurfaceConnectionNodeRenderer from './SurfaceConnectionNodeRenderer.tsx';

type SurfaceConnectionNodeDetails = SurfaceDataConnectionSettings & {
  Name?: string;
  Description?: string;
};

/**
 * Capability for `surface->connection` nodes within scoped surfaces.
 *
 * Supports rendering, edge inference to downstream schemas, and patch generation.
 */
export class SurfaceConnectionNodeCapabilityManager
  extends EaCNodeCapabilityManager<SurfaceConnectionNodeDetails> {
  protected static renderer: ComponentType = memo(
    SurfaceConnectionNodeRenderer as FunctionComponent,
  );

  public override Type = 'surface->connection';

  protected override buildAsCode(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): EaCNodeCapabilityAsCode<SurfaceConnectionNodeDetails> | null {
    const [surfaceId, connId] = this.extractCompoundIDs(node);
    const eac = context.GetEaC();

    const surface = eac.Surfaces?.[surfaceId];
    const conn = eac.DataConnections?.[connId];
    const settings = surface?.DataConnections?.[connId];

    if (!conn || !settings) return null;

    return {
      Metadata: {
        ...(conn.Metadata ?? {}),
        ...(settings.Metadata ?? {}),
      },
      Details: {
        Name: conn.Details?.Name ?? connId,
        Description: conn.Details?.Description,
        ...settings,
      },
    };
  }

  protected override buildConnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): Partial<OpenIndustrialEaC> | null {
    return null;
  }

  protected override buildDeletePatch(
    node: FlowGraphNode,
  ): NullableArrayOrObject<OpenIndustrialEaC> {
    const [surfaceId, connId] = this.extractCompoundIDs(node);

    return {
      Surfaces: {
        [surfaceId]: {
          DataConnections: {
            [connId]: null,
          },
        },
      },
    } as unknown as NullableArrayOrObject<OpenIndustrialEaC>;
  }

  protected override buildDisconnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): Partial<OpenIndustrialEaC> | null {
    return null;
  }

  protected override buildEdgesForNode(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): FlowGraphEdge[] {
    const eac = context.GetEaC() as EverythingAsCodeOIWorkspace;
    const [_, connId] = this.extractCompoundIDs(node);
    const surfaceId = context.SurfaceLookup;

    const edges: FlowGraphEdge[] = [];

    for (const [schemaKey, schema] of Object.entries(eac.Schemas ?? {})) {
      if (schema.DataConnection?.Lookup === connId) {
        edges.push({
          ID: `${connId}->${schemaKey}`,
          Source: `${surfaceId}->${connId}`,
          Target: schemaKey,
          Label: 'feeds',
        });
      }
    }

    return edges;
  }

  protected override buildNode(
    id: string,
    context: EaCNodeCapabilityContext,
  ): FlowGraphNode | null {
    const [surfaceId, connId] = this.extractCompoundIDs({
      ID: id,
      Type: this.Type,
    });

    const eac = context.GetEaC() as EverythingAsCodeOIWorkspace;

    const surface = eac.Surfaces?.[surfaceId];
    const dcSettings = surface?.DataConnections?.[connId];
    const conn = eac.DataConnections?.[connId];

    if (!conn || !dcSettings || dcSettings.Metadata?.Enabled === false) {
      return null;
    }

    const { Metadata, ...settings } = dcSettings;

    return {
      ID: id,
      Type: this.Type,
      Label: conn.Details?.Name ?? connId,
      Metadata: {
        ...(conn.Metadata || {}),
        ...Metadata,
      },
      Details: {
        Name: conn.Details?.Name,
        ...settings,
      },
    };
  }

  protected override buildUpdatePatch(
    node: FlowGraphNode,
    patch: EaCNodeCapabilityPatch<SurfaceConnectionNodeDetails>,
    _context: EaCNodeCapabilityContext,
  ): Partial<OpenIndustrialEaC> {
    const [surfaceId, connId] = this.extractCompoundIDs(node);

    return {
      Surfaces: {
        [surfaceId]: {
          DataConnections: {
            [connId]: {
              ...patch.Details,
              Metadata: patch.Metadata,
            },
          },
        },
      },
    };
  }

  protected override getInspector() {
    return SurfaceConnectionInspector;
  }

  protected override getRenderer() {
    return SurfaceConnectionNodeCapabilityManager.renderer;
  }
}

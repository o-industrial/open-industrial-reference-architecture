import { Position } from '../../../../eac/.exports.ts';
import { EaCFlowNodeMetadata } from '../../../../eac/EaCFlowNodeMetadata.ts';
import {
  EaCSurfaceAsCode,
  SurfaceDataConnectionSettings,
} from '../../../../eac/EaCSurfaceAsCode.ts';
import { EverythingAsCodeOIWorkspace } from '../../../../eac/EverythingAsCodeOIWorkspace.ts';
import {
  EaCNodeCapabilityAsCode,
  EaCNodeCapabilityContext,
  EaCNodeCapabilityManager,
  EaCNodeCapabilityPatch,
  FlowGraphEdge,
  FlowGraphNode,
  SurfaceEventRouter,
  WorkspaceManager,
} from '../../../../flow/.exports.ts';
import { ComponentType, FunctionComponent, memo, NullableArrayOrObject } from '../../.deps.ts';
import { SurfaceInspector } from './SurfaceInspector.tsx';
import SurfaceNodeRenderer from './SurfaceNodeRenderer.tsx';

/**
 * Capability manager for root-level surfaces (in workspace scope).
 * Handles rendering and parent-child surface edge creation.
 */
export class SurfaceNodeCapabilityManager extends EaCNodeCapabilityManager {
  protected static renderer: ComponentType = memo(
    SurfaceNodeRenderer as FunctionComponent,
  );

  public override Type = 'surface';

  protected override buildAsCode(
    node: FlowGraphNode,
    ctx: EaCNodeCapabilityContext,
  ): EaCNodeCapabilityAsCode | null {
    const surf = ctx.GetEaC().Surfaces?.[node.ID];
    if (!surf) return null;

    return {
      Metadata: surf.Metadata,
      Details: surf.Details ?? {},
    };
  }

  protected override buildConnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    ctx: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> | null {
    const eac = ctx.GetEaC() as EverythingAsCodeOIWorkspace;

    // surface -> surface (assign parent)
    if (source.Type.includes('surface') && target.Type.includes('surface')) {
      const existing = eac.Surfaces?.[target.ID]?.ParentSurfaceLookup;
      if (existing === source.ID) return null;

      return {
        Surfaces: {
          [target.ID]: {
            ...eac.Surfaces?.[target.ID],
            ParentSurfaceLookup: source.ID,
          } as EaCSurfaceAsCode,
        },
      };
    } else if (source.Type.includes('connection') && target.Type.includes('surface')) {
      const surface = eac.Surfaces?.[target.ID];
      const connSet: Record<string, SurfaceDataConnectionSettings> = {
        ...(surface?.DataConnections ?? {}),
        [source.ID]: {
          Metadata: { Enabled: true },
        },
      };

      return {
        Surfaces: {
          [target.ID]: {
            ...surface,
            DataConnections: connSet,
          } as EaCSurfaceAsCode,
        },
      };
    }

    return null;
  }

  protected override buildDeletePatch(
    node: FlowGraphNode,
  ): NullableArrayOrObject<EverythingAsCodeOIWorkspace> {
    return this.wrapDeletePatch('Surfaces', node.ID);
  }

  protected override buildDisconnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    ctx: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> | null {
    const eac = ctx.GetEaC() as EverythingAsCodeOIWorkspace;

    // Remove parent-child surface relationship
    if (source.Type.includes('surface') && target.Type.includes('surface')) {
      const targetSurface = eac.Surfaces?.[target.ID];

      if (targetSurface?.ParentSurfaceLookup === source.ID) {
        return {
          Surfaces: {
            [target.ID]: {
              ...targetSurface,
              ParentSurfaceLookup: undefined,
            },
          },
        };
      }
    } else if (source.Type.includes('connection') && target.Type.includes('surface')) {
      const surface = eac.Surfaces?.[target.ID];
      if (surface?.DataConnections?.[source.ID]) {
        const updatedConnections = { ...surface.DataConnections };
        delete updatedConnections[source.ID];

        return {
          Surfaces: {
            [target.ID]: {
              ...surface,
              DataConnections: updatedConnections,
            },
          },
        };
      }
    }

    return null;
  }

  protected override buildEdgesForNode(
    node: FlowGraphNode,
    ctx: EaCNodeCapabilityContext,
  ): FlowGraphEdge[] {
    const eac = ctx.GetEaC() as EverythingAsCodeOIWorkspace;

    const edges: FlowGraphEdge[] = [];

    const surf = eac.Surfaces?.[node.ID];
    if (!surf) return edges;

    // --- connections feeding this surface
    for (const connKey of Object.keys(surf.DataConnections ?? {})) {
      edges.push({
        ID: `${connKey}->${node.ID}`,
        Source: connKey,
        Target: node.ID,
        Label: 'feeds',
      });
    }

    // --- children that this surface is parent of
    for (const [childKey, childSurf] of Object.entries(eac.Surfaces ?? {})) {
      if (childSurf.ParentSurfaceLookup === node.ID) {
        edges.push({
          ID: `${node.ID}->${childKey}`,
          Source: node.ID,
          Target: childKey,
          Label: 'parent',
        });
      }
    }

    return edges;
  }

  protected override buildNode(
    id: string,
    ctx: EaCNodeCapabilityContext,
  ): FlowGraphNode | null {
    const surf = ctx.GetEaC().Surfaces?.[id];

    // Only emit root surfaces
    if (!surf || surf.ParentSurfaceLookup) return null;

    return {
      ID: id,
      Type: this.Type,
      Label: surf.Details?.Name ?? id,
      Metadata: surf.Metadata,
      Details: surf.Details,
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

    const details = { Name: id };

    return {
      Surfaces: {
        [id]: {
          Metadata: metadata,
          Details: details,
          ...(context.SurfaceLookup
            ? {
              ParentSurfaceLookup: context.SurfaceLookup,
            }
            : {}),
        } as EaCSurfaceAsCode,
      },
    };
  }

  protected override buildUpdatePatch(
    node: FlowGraphNode,
    update: EaCNodeCapabilityPatch,
  ): Partial<EverythingAsCodeOIWorkspace> {
    return {
      Surfaces: {
        [node.ID]: this.mergeDetailsAndMetadata(
          update.Details,
          update.Metadata,
        ),
      },
    };
  }

  protected override getEventRouter(workspace: WorkspaceManager) {
    return new SurfaceEventRouter(workspace);
  }

  protected override getInspector() {
    return SurfaceInspector;
  }

  protected override getPreset() {
    return { Type: this.Type, Label: 'Surface', IconKey: 'surface' };
  }

  protected override getRenderer() {
    return SurfaceNodeCapabilityManager.renderer;
  }
}

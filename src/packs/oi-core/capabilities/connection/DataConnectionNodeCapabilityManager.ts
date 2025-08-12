import { Position } from '../../../../eac/.exports.ts';
import { EaCAzureIoTHubDataConnectionDetails } from '../../../../eac/EaCAzureIoTHubDataConnectionDetails.ts';
import { EaCDataConnectionAsCode } from '../../../../eac/EaCDataConnectionAsCode.ts';
import { EaCFlowNodeMetadata } from '../../../../eac/EaCFlowNodeMetadata.ts';
import { EverythingAsCodeOIWorkspace } from '../../../../eac/EverythingAsCodeOIWorkspace.ts';
import { merge } from '../../../../flow/.deps.ts';
import {
  EaCNodeCapabilityAsCode,
  EaCNodeCapabilityContext,
  EaCNodeCapabilityManager,
  EaCNodeCapabilityPatch,
  FlowGraphEdge,
  FlowGraphNode,
} from '../../../../flow/.exports.ts';
import { APIEndpointDescriptor } from '../../../../types/APIEndpointDescriptor.ts';
import { ComponentType, FunctionComponent, memo, NullableArrayOrObject } from '../../.deps.ts';
import { ConnectionInspector } from './ConnectionInspector.tsx';
import ConnectionNodeRenderer from './ConnectionNodeRenderer.tsx';

/**
 * Capability manager for workspace-scoped Data Connections.
 * Handles simulator binding, surface association, and node projection.
 */
export class DataConnectionNodeCapabilityManager extends EaCNodeCapabilityManager {
  protected static renderer: ComponentType = memo(
    ConnectionNodeRenderer as FunctionComponent,
  );

  public override Type = 'connection';

  protected override buildAsCode(
    node: FlowGraphNode,
    ctx: EaCNodeCapabilityContext,
  ): EaCNodeCapabilityAsCode | null {
    const conn = ctx.GetEaC().DataConnections?.[node.ID];
    if (!conn) return null;

    return {
      Metadata: conn.Metadata,
      Details: conn.Details ?? {},
    };
  }

  protected override buildConnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    ctx: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> | null {
    const eac = ctx.GetEaC() as EverythingAsCodeOIWorkspace;

    // simulator → connection
    if (source.Type.includes('simulator') && target.Type.includes('connection')) {
      const existing = eac.DataConnections?.[target.ID]?.SimulatorLookup;
      if (existing === source.ID) return null;

      return {
        DataConnections: {
          [target.ID]: {
            ...eac.DataConnections?.[target.ID],
            SimulatorLookup: source.ID,
          } as EaCDataConnectionAsCode,
        },
      };
    }

    return null;
  }

  protected override buildDeletePatch(
    node: FlowGraphNode,
  ): NullableArrayOrObject<EverythingAsCodeOIWorkspace> {
    return this.wrapDeletePatch('DataConnections', node.ID);
  }

  protected override buildDisconnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    ctx: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> | null {
    const eac = ctx.GetEaC() as EverythingAsCodeOIWorkspace;

    // simulator → connection
    if (source.Type.includes('simulator') && target.Type.includes('connection')) {
      const existing = eac.DataConnections?.[target.ID]?.SimulatorLookup;

      if (existing === source.ID) {
        return {
          DataConnections: {
            [target.ID]: {
              ...eac.DataConnections?.[target.ID],
              SimulatorLookup: undefined,
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

    for (const [surfKey, surf] of Object.entries(eac.Surfaces ?? {})) {
      if (surf.DataConnections?.[node.ID]) {
        edges.push({
          ID: `${node.ID}->${surfKey}`,
          Source: node.ID,
          Target: surfKey,
          Label: 'feeds',
        });
      }
    }

    return edges;
  }

  protected override buildNode(
    id: string,
    ctx: EaCNodeCapabilityContext,
  ): FlowGraphNode | null {
    const conn = ctx.GetEaC().DataConnections?.[id];
    if (!conn) return null;

    return {
      ID: id,
      Type: this.Type,
      Label: conn.Details?.Name ?? id,
      Metadata: conn.Metadata,
      Details: conn.Details,
    };
  }

  protected override buildPresetPatch(
    id: string,
    position: Position,
    _context: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> {
    const metadata: EaCFlowNodeMetadata = {
      Position: position,
      Enabled: true,
    };

    const details = { Name: id };

    return {
      DataConnections: {
        [id]: {
          Metadata: metadata,
          Details: {
            ...details,
            Type: 'AzureIoTHub',
          } as EaCAzureIoTHubDataConnectionDetails,
        } as EaCDataConnectionAsCode,
      },
    };
  }

  protected override buildUpdatePatch(
    node: FlowGraphNode,
    update: EaCNodeCapabilityPatch,
  ): Partial<EverythingAsCodeOIWorkspace> {
    return {
      DataConnections: {
        [node.ID]: {
          Details: merge(node.Details || {}, update.Details || {}),
          Metadata: merge(node.Metadata || {}, update.Metadata || {}),
        } as EaCDataConnectionAsCode,
      },
    };
  }

  protected override getConfig(_id: string): Record<string, unknown> {
    return {
      ingestOptions: [
        { label: 'Default', value: 'Default', enabled: true },
        { label: 'HTTP', value: 'HTTP', enabled: true },
        { label: 'MQTT', value: 'MQTT', enabled: false },
        { label: 'ModBUS', value: 'ModBUS', enabled: false },
        { label: 'OPC', value: 'OPC', enabled: false },
        { label: 'Web Socket', value: 'WebSocket', enabled: false },
      ],
    };
  }

  protected override getInspector() {
    return ConnectionInspector;
  }

  protected override getPreset() {
    return {
      Type: this.Type,
      Label: 'Connection',
      IconKey: 'connection',
    };
  }

  protected override getAPIDescriptors(
    node: FlowGraphNode,
    _ctx: EaCNodeCapabilityContext,
  ): APIEndpointDescriptor[] {
    const base = `/api/data/${node.ID}`;

    return [
      {
        Method: 'GET',
        Path: `${base}/cold`,
        Handler: 'ColdExportController',
        Cold: true,
      } as APIEndpointDescriptor,
      {
        Method: 'POST',
        Path: `${base}/warm`,
        Handler: 'WarmQueryController',
        Warm: true,
      } as APIEndpointDescriptor,
      { Method: 'GET', Path: `${base}/sse`, SSE: true } as APIEndpointDescriptor,
      { Method: 'GET', Path: `${base}/ws`, WebSocket: true } as APIEndpointDescriptor,
      { Method: 'POST', Path: `${base}/chat`, Chat: true } as APIEndpointDescriptor,
    ];
  }

  protected override getRenderer() {
    return DataConnectionNodeCapabilityManager.renderer;
  }

  // protected override async getStats(
  //   type: string,
  //   id: string,
  //   _context: EaCNodeCapabilityContext
  // ): Promise<DataConnectionStats> {
  //   return await this.oiSvc.Stats.GetStats(type, id);

  //   // const stats = await super.getStats(type, id, context);

  //   // return {
  //   //   ...stats,
  //   //   ConnectionInfo: {
  //   //     BaseURL: 'https://api.mock.local',
  //   //     Method: 'POST',
  //   //     AuthType: 'SAS Token',
  //   //     Status: 'Healthy',
  //   //   },
  //   // };
  // }
}

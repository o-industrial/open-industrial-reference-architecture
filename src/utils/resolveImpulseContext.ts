import { EverythingAsCodeOIWorkspace } from '../../src/eac/EverythingAsCodeOIWorkspace.ts';
import { RuntimeImpulse, RuntimeImpulseSources } from '../../src/types/RuntimeImpulse.ts';
import { EaCSchemaDetails } from '../eac/EaCSchemaDetails.ts';
import {
  SurfaceAgentSettings,
  SurfaceDataConnectionSettings,
  SurfaceInterfaceSettings,
  SurfaceSchemaSettings,
} from '../eac/EaCSurfaceAsCode.ts';
import { EaCDataConnectionDetails } from '../eac/EaCDataConnectionDetails.ts';
import { EaCInterfaceDetails } from '../eac/EaCInterfaceDetails.ts';
import { EaCWarmQueryDetails } from './.deps.ts';
import { EaCAgentDetails } from '../eac/EaCAgentDetails.ts';
import { EaCSurfaceDetails } from '../eac/EaCSurfaceDetails.ts';

export type ResolvedImpulseContext =
  & { Source?: RuntimeImpulseSources }
  & (
    | {
      Source?: undefined;
      Agent?: undefined;
      MatchedSchema?: undefined;
      Surface?: undefined;
      SurfaceAgent?: undefined;
      Schema?: undefined;
      SurfaceSchema?: undefined;
      Connection?: undefined;
      SurfaceConnection?: undefined;
      WarmQuery?: undefined;
      EventType?: undefined;
      Workspace?: undefined;
    }
    | {
      Source: 'DataConnection';
      Connection: EaCDataConnectionDetails;
    }
    | {
      Source: 'SurfaceAgent';
      Agent: EaCAgentDetails;
      MatchedSchema: EaCSchemaDetails;
      Surface: EaCSurfaceDetails;
      SurfaceAgent: SurfaceAgentSettings;
    }
    | {
      Source: 'SurfaceSchema';
      Schema: EaCSchemaDetails;
      Surface: EaCSurfaceDetails;
      SurfaceSchema: SurfaceSchemaSettings;
    }
    | {
      Source: 'SurfaceConnection';
      Connection: EaCDataConnectionDetails;
      Surface: EaCSurfaceDetails;
      SurfaceConnection: SurfaceDataConnectionSettings;
    }
    | {
      Source: 'SurfaceWarmQuery';
      Surface: EaCSurfaceDetails;
      WarmQuery: EaCWarmQueryDetails;
    }
    | {
      Source: 'SurfaceInterface';
      Interface: EaCInterfaceDetails;
      Surface: EaCSurfaceDetails;
      SurfaceInterface: SurfaceInterfaceSettings;
    }
    | {
      Source: 'System';
      EventType: string;
      Workspace: EverythingAsCodeOIWorkspace;
    }
  );

export function resolveImpulseContext(
  impulse: RuntimeImpulse,
  eac: EverythingAsCodeOIWorkspace,
): ResolvedImpulseContext {
  const { Source, Metadata } = impulse;

  if (!Metadata) return {};

  if (Source === 'DataConnection') {
    return {
      Source,
      Connection: eac.DataConnections?.[Metadata.ConnectionLookup!]?.Details!,
    };
  }

  if (Source === 'SurfaceAgent') {
    return {
      Source,
      Agent: eac.Agents?.[Metadata.AgentLookup!]?.Details!,
      MatchedSchema: eac.Schemas?.[Metadata.MatchedSchemaLookup!]?.Details!,
      Surface: eac.Surfaces?.[Metadata.SurfaceLookup!]?.Details!,
      SurfaceAgent: eac.Surfaces?.[Metadata.SurfaceLookup!]?.Agents?.[
        Metadata.AgentLookup!
      ]!,
    };
  }

  if (Source === 'SurfaceSchema') {
    return {
      Source,
      Schema: eac.Schemas?.[Metadata.SchemaLookup!]?.Details!,
      Surface: eac.Surfaces?.[Metadata.SurfaceLookup!]?.Details!,
      SurfaceSchema: eac.Surfaces?.[Metadata.SurfaceLookup!]?.Schemas?.[
        Metadata.SchemaLookup!
      ]!,
    };
  }

  if (Source === 'SurfaceConnection') {
    return {
      Source,
      Connection: eac.DataConnections?.[Metadata.ConnectionLookup!]?.Details!,
      Surface: eac.Surfaces?.[Metadata.SurfaceLookup!]?.Details!,
      SurfaceConnection: eac.Surfaces?.[Metadata.SurfaceLookup!]?.DataConnections?.[
        Metadata.ConnectionLookup!
      ]!,
    };
  }

  if (Source === 'SurfaceInterface') {
    return {
      Source,
      Interface: eac.Interfaces?.[Metadata.InterfaceLookup!]?.Details!,
      Surface: eac.Surfaces?.[Metadata.SurfaceLookup!]?.Details!,
      SurfaceInterface: eac.Surfaces?.[Metadata.SurfaceLookup!]?.Interfaces
        ?.[Metadata.InterfaceLookup!]!,
    };
  }

  if (Source === 'SurfaceWarmQuery') {
    return {
      Source,
      Surface: eac.Surfaces?.[Metadata.SurfaceLookup!]?.Details!,
      WarmQuery: eac.WarmQueries?.[Metadata.WarmQueryLookup!]?.Details!,
      // SurfaceWarmQuery: eac.Surfaces?.[Metadata.SurfaceLookup!]?.WarmQueries?.[Metadata.WarmQueryLookup!]!,
    };
  }

  if (Source === 'System') {
    return {
      Source,
      EventType: Metadata.EventType,
      Workspace: eac,
    };
  }

  return {};
}

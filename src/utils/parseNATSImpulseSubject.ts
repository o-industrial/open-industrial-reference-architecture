import { BaseImpulseFields, RuntimeImpulse } from '../types/RuntimeImpulse.ts';

/**
 * Return a structured set of URLPattern objects to match known NATS subject structures.
 */
function loadPatterns() {
  return {
    dataConnection: new URLPattern({
      pathname: '/workspace/:workspace/data-connection/:connection/impulse',
    }),
    surfaceConnection: new URLPattern({
      pathname:
        '/workspace/:workspace/surface/:surface/connection/:connection/impulse',
    }),
    surfaceAgent: new URLPattern({
      pathname: '/workspace/:workspace/surface/:surface/agent/:agent/impulse',
    }),
    surfaceSchema: new URLPattern({
      pathname: '/workspace/:workspace/surface/:surface/schema/:schema/impulse',
    }),
    surfaceWarmQuery: new URLPattern({
      pathname:
        '/workspace/:workspace/surface/:surface/warmquery/:warmquery/impulse',
    }),
    signal: new URLPattern({
      pathname: '/workspace/:workspace/surface/:surface/signal/:signal/impulse',
    }),
  };
}

/**
 * Parse a NATS subject and convert it into a strongly typed RuntimeImpulse.
 */
export function parseNATSImpulseSubject(
  subject: string,
  payload: Record<string, unknown>,
  natsHeaders?: Headers
): RuntimeImpulse {
  const path = '/' + subject.replace(/\./g, '/');
  const patterns = loadPatterns();

  const base = {
    Timestamp: new Date().toISOString(),
    Confidence: 1.0,
    Payload: payload,
    Subject: subject,
  };

  // Convert and include headers in .Raw for reference/debugging
  if (natsHeaders) {
    const headerMap: Record<string, string> = {};

    for (const [key, value] of natsHeaders.entries()) {
      headerMap[key] = value;
    }

    (base as any).Raw = { Headers: headerMap };
  }

  const matchAndBuild = <T extends RuntimeImpulse>(
    pattern: URLPattern,
    builder: (groups: Record<string, string>) => T
  ): T | null => {
    const result = pattern.exec({ pathname: path });

    if (!result) return null;

    const rawGroups = result.pathname.groups;
    const groups: Record<string, string> = {};

    for (const [key, value] of Object.entries(rawGroups)) {
      if (typeof value !== 'string') return null;
      groups[key] = value;
    }

    return builder(groups);
  };

  return (
    matchAndBuild(patterns.signal, ({ signal, agent }) => ({
      ...base,
      Source: 'Signal',
      Metadata: {
        SignalLookup: signal,
        TriggeringAgentLookup: agent ?? 'unknown',
      },
    })) ??
    matchAndBuild(patterns.surfaceAgent, ({ surface, agent }) => ({
      ...base,
      Source: 'SurfaceAgent',
      Metadata: {
        SurfaceLookup: surface,
        AgentLookup: agent,
        AgentVersion: 'v1',
        MatchedSchemaLookup: 'unknown',
      },
    })) ??
    matchAndBuild(patterns.surfaceSchema, ({ surface, schema }) => ({
      ...base,
      Source: 'SurfaceSchema',
      Metadata: {
        SurfaceLookup: surface,
        SchemaLookup: schema,
        SchemaVersion: 'v1',
      },
    })) ??
    matchAndBuild(patterns.surfaceWarmQuery, ({ surface, warmquery }) => ({
      ...base,
      Source: 'SurfaceWarmQuery',
      Metadata: {
        SurfaceLookup: surface,
        WarmQueryLookup: warmquery,
      },
    })) ??
    matchAndBuild(patterns.surfaceConnection, ({ surface, connection }) => ({
      ...base,
      Source: 'SurfaceConnection',
      Metadata: {
        SurfaceLookup: surface,
        ConnectionLookup: connection,
      },
    })) ??
    matchAndBuild(patterns.dataConnection, ({ connection }) => ({
      ...base,
      Source: 'DataConnection',
      Metadata: {
        ConnectionLookup: connection,
      },
    })) ?? {
      ...base,
      Source: 'System',
      Metadata: {
        EventType: 'UnrecognizedSubject',
      },
    }
  );
}

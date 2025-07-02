import { RuntimeImpulse } from '../types/RuntimeImpulse.ts';

function loadPatterns() {
  return {
    dataConnection: new URLPattern({
      pathname: '/workspace/:workspace/connection/:connection/impulse',
    }),
    surfaceConnection: new URLPattern({
      pathname: '/workspace/:workspace/surface/:surface/connection/:connection/impulse',
    }),
    surfaceAgent: new URLPattern({
      pathname: '/workspace/:workspace/surface/:surface/agent/:agent/impulse',
    }),
    surfaceSchema: new URLPattern({
      pathname: '/workspace/:workspace/surface/:surface/schema/:schema/impulse',
    }),
    surfaceWarmQuery: new URLPattern({
      pathname: '/workspace/:workspace/surface/:surface/warmquery/:warmquery/impulse',
    }),
    signal: new URLPattern({
      pathname: '/workspace/:workspace/surface/:surface/signal/:signal/impulse',
    }),
  };
}

export function buildRuntimeImpulseForSubject(
  subject: string,
  payload: Record<string, unknown>,
  systemProperties: Record<string, string>,
): RuntimeImpulse {
  const path = '/' + subject.replace(/\./g, '/');
  const patterns = loadPatterns();

  const timestamp = new Date(systemProperties['iothub-enqueuedtime']) ??
    new Date(systemProperties['enqueuedTimeUtc']) ??
    new Date();

  const id = systemProperties['message-id'] ?? crypto.randomUUID();

  const base = {
    ID: id,
    Timestamp: timestamp.toISOString(),
    Confidence: 1.0,
    Payload: payload,
    Subject: subject,
    Headers: systemProperties,
  };

  function matchAndBuild<T extends RuntimeImpulse>(
    pattern: URLPattern,
    builder: (groups: Record<string, string>) => T,
  ): T | null {
    const result = pattern.exec({ pathname: path });
    if (!result) return null;

    const rawGroups = result.pathname.groups;
    const groups: Record<string, string> = {};

    for (const [key, value] of Object.entries(rawGroups)) {
      if (typeof value !== 'string') return null;
      groups[key] = value;
    }

    return builder(groups);
  }

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
          MatchedSchemaLookup: 'unknown',
        },
      })) ??
      matchAndBuild(patterns.surfaceSchema, ({ surface, schema }) => ({
        ...base,
        Source: 'SurfaceSchema',
        Metadata: {
          SurfaceLookup: surface,
          SchemaLookup: schema,
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

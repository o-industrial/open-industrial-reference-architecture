// deno-lint-ignore-file no-explicit-any
import {
  Codec,
  DeliverPolicy,
  EaCRuntimeContext,
  EaCRuntimeHandler,
  EaCRuntimeHandlerPipeline,
  establishJwtValidationMiddleware,
  getPackageLogger,
  JetStreamClient,
  JetStreamManager,
  loadJwtConfig,
  Logger,
  ProcessorHandlerResolver,
  RetentionPolicy,
} from '../.deps.ts';
import { connectNATSMiddleware, NATSContext } from '../../api/middlewares/connectNATSMiddleware.ts';
import { OpenIndustrialJWTPayload } from '../../types/OpenIndustrialJWTPayload.ts';
import { RuntimeImpulse } from '../../types/RuntimeImpulse.ts';
import { buildNATSSubject } from '../../utils/buildNATSSubject.ts';
import { createEphemeralConsumer } from '../../utils/createEphemeralConsumer.ts';
import { isEaCOIImpulseStreamProcessor } from './EaCOIImpulseStreamProcessor.ts';
import { ensureWorkspaceSurfaceJetStream } from '../../utils/ensureWorkspaceSurfaceJetStream.ts';
import { ensureWorkspaceJetStreamBuilder } from '../../utils/ensureWorkspaceJetStream.ts';
import { MaybeAsync } from '../../fluent/types/MaybeAsync.ts';
import { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import { OpenIndustrialAPIClient } from '../../api/clients/OpenIndustrialAPIClient.ts';

type ImpulseRuntime = {
  AddWebSocketListener: (
    cb: (impulse: RuntimeImpulse) => void,
  ) => Promise<() => void>;
  Close: () => MaybeAsync<void>;
};

export const EaCOIImpulseStreamProcessorHandlerResolver: ProcessorHandlerResolver = {
  async Resolve(_ioc, appProcCfg, _eac): Promise<EaCRuntimeHandler> {
    const logger = await getPackageLogger(import.meta);
    const proc = appProcCfg.Application.Processor;

    if (!isEaCOIImpulseStreamProcessor(proc)) {
      throw new Deno.errors.NotSupported(
        'Invalid EaCOIImpulseStreamProcessor configuration.',
      );
    }

    logger.info('[ImpulseStream] ✅ Processor initialized using shared NATS');

    const impulseRuntimeCache = new Map<string, Promise<ImpulseRuntime>>();
    const pipeline = new EaCRuntimeHandlerPipeline();

    pipeline.Append(establishJwtValidationMiddleware(loadJwtConfig()));
    pipeline.Append(connectNATSMiddleware() as EaCRuntimeHandler);
    pipeline.Append(
      establishImpulseRuntime(proc.OIServiceURL, impulseRuntimeCache, logger),
    );
    pipeline.Append(streamImpulses(impulseRuntimeCache, logger));

    return (req, ctx) => {
      const method = req.method.toUpperCase();
      const headers = Object.fromEntries(req.headers.entries());

      console.log(
        `[ImpulseStream] 📡 Incoming ${method} request: ${req.url}`,
      );
      console.log(`[ImpulseStream] 📡 Headers:`, headers);

      if (method === 'OPTIONS') {
        // 🔐 CORS preflight support
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Authorization, Content-Type',
            'Access-Control-Max-Age': '86400', // 24 hours
          },
        });
      }

      return pipeline.Execute(req, ctx);
    };
  },
};

function streamImpulses(
  impulseRuntimeCache: Map<string, Promise<ImpulseRuntime>>,
  logger: Logger,
): EaCRuntimeHandler {
  return (async (
    req,
    ctx: EaCRuntimeContext<OpenIndustrialJWTPayload & NATSContext>,
  ) => {
    const { WorkspaceLookup: workspace } = ctx.State;

    const surfaceFilter = ctx.Runtime.URLMatch.SearchParams?.get('surface') ?? undefined;
    const schemaFilter = ctx.Runtime.URLMatch.SearchParams?.get('schema') ?? undefined;

    logger.info('[ImpulseStream] 🔌 WebSocket upgrade complete');

    try {
      return await handleImpulseStreamConnection({
        req,
        impulseRuntimeCache,
        logger,
        workspace,
        surfaceFilter,
        schemaFilter,
      });
    } catch (err) {
      logger.error('[ImpulseStream] unhandled error in stream handler:');
      logger.error(err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }) as EaCRuntimeHandler;
}

function establishImpulseRuntime(
  oiServiceURL: string,
  impulseRuntimeCache: Map<string, Promise<ImpulseRuntime>>,
  logger: Logger,
): EaCRuntimeHandler {
  return ((
    _req,
    {
      Runtime,
      State,
      Next,
    }: EaCRuntimeContext<OpenIndustrialJWTPayload & NATSContext>,
  ) => {
    const { NATS, WorkspaceLookup: workspace } = State;
    const { JetStream, JetStreamManager, SC } = NATS;

    if (!workspace) {
      logger.error('[ImpulseStream] ❌ Missing workspace');
      return new Response('Missing workspace parameter', { status: 400 });
    }

    const surfaceFilter = Runtime.URLMatch.SearchParams?.get('surface') ?? undefined;

    logger.info(
      `[ImpulseStream] 🔍 Preparing stream for workspace: ${workspace}, surface: ${
        surfaceFilter ?? '*'
      }`,
    );

    const cacheKey = `${workspace}::${surfaceFilter ?? '*'}`;

    if (!impulseRuntimeCache.has(cacheKey)) {
      logger.debug(
        `[ImpulseStream] 🆕 Creating new impulse runtime: ${cacheKey}`,
      );
      impulseRuntimeCache.set(
        cacheKey,
        createImpulseRuntime({
          oiServiceURL,
          workspace,
          surfaceFilter,
          JetStream,
          jsm: JetStreamManager,
          SC,
          logger,
          jwt: State.JWT,
        }),
      );
    }

    return Next();
  }) as EaCRuntimeHandler;
}

async function createImpulseRuntime({
  oiServiceURL,
  workspace,
  surfaceFilter,
  JetStream,
  jsm,
  SC,
  logger,
  jwt,
}: {
  oiServiceURL: string;
  workspace: string;
  surfaceFilter?: string;
  JetStream: JetStreamClient;
  jsm: JetStreamManager;
  SC: Codec<string>;
  logger: Logger;
  jwt: string;
}): Promise<ImpulseRuntime> {
  const subject = buildNATSSubject(workspace, surfaceFilter);
  const stream = `workspace.${workspace}${surfaceFilter ? `.surface.${surfaceFilter}` : ''}`;

  logger.info('[ImpulseStream] 🧩 Stream config', { stream, subject });

  const jsmDefaults = {
    max_msgs_per_subject: 1000,
    retention: RetentionPolicy.Limits,
    max_age: 0,
  };

  if (surfaceFilter) {
    await ensureWorkspaceSurfaceJetStream(
      jsm,
      workspace,
      surfaceFilter,
      jsmDefaults,
      false,
    );
  } else {
    await ensureWorkspaceJetStreamBuilder(jsm, workspace, jsmDefaults, false);
  }

  logger.info('[ImpulseStream] ✅ Stream ensured');

  let eac: EverythingAsCodeOIWorkspace;

  const loadEaC = async () => {
    const oiSvc = new OpenIndustrialAPIClient(new URL(oiServiceURL), jwt);

    eac = await oiSvc.Workspaces.Get();
  };

  let refreshTimer: number | undefined;

  const scheduleEaCRefresh = () => {
    if (refreshTimer) {
      return;
    }

    refreshTimer = setTimeout(async () => {
      refreshTimer = undefined;
      await loadEaC();
    }, 5000);
  };

  await loadEaC();

  return {
    AddWebSocketListener: async (cb) => {
      logger.info('[ImpulseStream] 🔗 Listener added');
      const connectedAt = new Date();
      const consumer = await createEphemeralConsumer(
        JetStream,
        jsm,
        stream,
        subject,
        ({ subject, data, headers }) => {
          try {
            logger.debug('[ImpulseStream] 📥 Impulse received', { subject });
            const impulse: RuntimeImpulse = JSON.parse(SC.decode(data));

            const validation = validateImpulseAgainstEaC(impulse, eac);
            if (!validation.valid) {
              logger.warn('[WS] ❌ Impulse failed EaC validation');
              logger.warn(validation);
              // Trigger an EaC refresh so newly added resources (e.g.,
              // DataConnections/Surfaces) show up without restarting.
              scheduleEaCRefresh();
              return;
            }

            headers?.forEach((val, key) => {
              impulse.Headers[key] = val;
            });

            cb(impulse);

            // Keep EaC reasonably fresh even on valid traffic.
            scheduleEaCRefresh();
          } catch (err) {
            logger.warn('[ImpulseStream] ⚠️ Failed to parse impulse');
            logger.warn(err);
          }
        },
        {
          deliver_policy: DeliverPolicy.StartTime,
          opt_start_time: connectedAt.toISOString(),
        },
      );

      return () => {
        logger.info('[ImpulseStream] ❌ Listener removed');
        try {
          consumer.stop();
        } catch (err) {
          logger.warn('[ImpulseStream] ⚠️ Error stopping consumer');
          logger.warn(err);
        }
        // consumer
        //   .delete()
        //   .catch((err) => logger.warn('[ImpulseStream] ⚠️ Error deleting consumer', err));
      };
    },
    Close: () => {
      logger.info('[ImpulseStream] 🔒 Runtime closed');
    },
  };
}

function impulseMatchesFilter(
  impulse: RuntimeImpulse,
  surface?: string,
  schema?: string,
): boolean | undefined {
  const meta = impulse.Metadata;
  const matchesSurface = !surface ||
    (meta && 'SurfaceLookup' in meta && meta.SurfaceLookup === surface);
  const matchesSchema = !schema || (meta && 'SchemaLookup' in meta && meta.SchemaLookup === schema);
  return matchesSurface && matchesSchema;
}

async function handleImpulseStreamConnection({
  req,
  impulseRuntimeCache,
  logger,
  workspace,
  surfaceFilter,
  schemaFilter,
}: {
  req: Request;
  impulseRuntimeCache: Map<string, Promise<ImpulseRuntime>>;
  logger: Logger;
  workspace: string;
  surfaceFilter?: string;
  schemaFilter?: string;
}): Promise<Response> {
  logger.info('[WS-Only] 🔧 Attempting WebSocket upgrade...');

  if (req.headers.get('upgrade')?.toLowerCase() !== 'websocket') {
    logger.warn('[WS-Only] ❌ Not a WebSocket upgrade request');
    return new Response('Expected WebSocket upgrade', { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  let unsub: () => void;
  let closed = false;
  const HEARTBEAT_TIMEOUT_MS = 30000;
  let heartbeatTimer: number | undefined;
  let awaitingPong = false;

  const listener = (impulse: RuntimeImpulse) => {
    logger.debug(`[WS] 🎯 Impulse received by listener: ${impulse.Subject}`);

    if (!impulseMatchesFilter(impulse, surfaceFilter, schemaFilter)) {
      logger.debug('[WS] 🚫 Impulse filtered out');
      return;
    }

    if (socket.readyState === WebSocket.OPEN) {
      logger.debug(
        `[WS] ✅ Sending impulse to open socket: ${impulse.Subject}`,
      );
      try {
        socket.send(JSON.stringify(impulse));
      } catch (err) {
        logger.error('[WS] ❌ Send failed:');
        logger.error(err);
      }
    } else {
      logger.warn(
        `[WS] ⚠️ Socket not open — dropping impulse: ${impulse.Subject}`,
      );
    }
  };

  const cacheKey = `${workspace}::${surfaceFilter ?? '*'}`;

  const runtimePromise = impulseRuntimeCache.get(cacheKey);
  if (!runtimePromise) {
    logger.error(`[WS] ❌ No impulse runtime found for cache key: ${cacheKey}`);
    try {
      socket.close(1011, 'runtime unavailable');
    } catch (err) {
      logger.error('[WS] ❌ Error closing socket after missing runtime:');
      logger.error(err);
    }
    return new Response('Service Unavailable', { status: 503 });
  }
  const runtime = await runtimePromise;

  function shutdown() {
    if (!closed) {
      closed = true;
      if (heartbeatTimer) {
        clearTimeout(heartbeatTimer);
        heartbeatTimer = undefined;
      }
      logger.info('[WS] 🔻 Shutting down stream connection');
      // Remove this socket’s listener; consumer will be stopped and deleted
      try {
        unsub?.();
      } catch (err) {
        logger.error('[WS] ❌ Error removing listener:');
        logger.error(err);
      }
    }

    return Promise.resolve();
  }

  const scheduleHeartbeat = () => {
    heartbeatTimer = setTimeout(() => {
      if (awaitingPong) {
        logger.warn('[WS] 💔 No pong received - closing socket');
        try {
          socket.close(1000, 'heartbeat timeout');
        } catch (err) {
          logger.error('[WS] ❌ Error closing socket after missing pong:');
          logger.error(err);
        }
        shutdown();
        return;
      }
      try {
        awaitingPong = true;
        socket.send(
          JSON.stringify({ type: 'ping', ts: new Date().toISOString() }),
        );
      } catch (err) {
        logger.error('[WS] ❌ Failed to send ping:');
        logger.error(err);
      }
      scheduleHeartbeat();
    }, HEARTBEAT_TIMEOUT_MS);
  };

  socket.onopen = async () => {
    logger.info(`[WS] ✅ WebSocket opened: workspace=${workspace}`);

    try {
      unsub = await runtime.AddWebSocketListener(listener);
    } catch (err) {
      logger.error('[WS] ❌ Failed to create consumer:');
      logger.error(err);
      try {
        socket.close(1011, 'listener error');
      } catch (closeErr) {
        logger.error(
          '[WS] ❌ Error closing socket after listener failure:',
          closeErr,
        );
      }
      await shutdown();
      return;
    }

    socket.send(
      JSON.stringify({ status: 'connected', ts: new Date().toISOString() }),
    );
    scheduleHeartbeat();
  };

  socket.onmessage = (event) => {
    logger.info('[WS-Only] 📥 Received message:', event.data);
    try {
      const msg = typeof event.data === 'string' ? event.data : '';
      let parsed: unknown;
      try {
        parsed = JSON.parse(msg);
      } catch {
        parsed = undefined;
      }
      const isPong = (typeof parsed === 'object' &&
        parsed !== null &&
        'type' in parsed &&
        (parsed as { type: string }).type === 'pong') ||
        msg === 'pong';
      if (isPong) {
        awaitingPong = false;
        if (!closed) {
          if (heartbeatTimer) clearTimeout(heartbeatTimer);
          scheduleHeartbeat();
        }
        logger.debug('[WS] 💓 Pong received');
        return;
      }
    } catch (err) {
      logger.error('[WS] ❌ Error processing message:');
      logger.error(err);
    }
    socket.send(JSON.stringify({ echo: event.data }));
  };

  socket.onclose = async (event) => {
    logger.warn('[WS] 🔻 WebSocket closed:', event.reason || '(no reason)');
    await shutdown();
  };

  socket.onerror = async (evt: Event | ErrorEvent) => {
    const errEvt = evt as ErrorEvent;
    logger.error('[WS] ❌ WebSocket error:');
    logger.error({
      message: errEvt.message,
      error: errEvt.error, // This holds the underlying Error (e.g. Unexpected EOF)
      filename: errEvt.filename,
      lineno: errEvt.lineno,
      colno: errEvt.colno,
    });
    await shutdown();
  };

  return response;
}

type ImpulseValidationResult =
  | { valid: true }
  | {
    valid: false;
    code: string;
    reason: string;
    context?: Record<string, unknown>;
  };

function validateImpulseAgainstEaC(
  impulse: RuntimeImpulse,
  eac: EverythingAsCodeOIWorkspace,
): ImpulseValidationResult {
  if (impulse.Source === 'DataConnection') {
    const lookup = impulse.Metadata?.ConnectionLookup;
    if (!lookup) {
      return {
        valid: false,
        code: 'missing_connection_lookup',
        reason: 'Missing ConnectionLookup for DataConnection impulse.',
      };
    }
    if (!eac.DataConnections?.[lookup]) {
      return {
        valid: false,
        code: 'unknown_data_connection',
        reason:
          `DataConnection lookup ${lookup} not found in workspace EaC ${eac.EnterpriseLookup}.\n\n${
            JSON.stringify(eac.DataConnections, null, 2)
          }`,
        context: { lookup },
      };
    }
    return { valid: true };
  }

  if (impulse.Source === 'SurfaceConnection') {
    const sLookup = impulse.Metadata?.SurfaceLookup;
    const cLookup = impulse.Metadata?.ConnectionLookup;
    if (!sLookup || !cLookup) {
      return {
        valid: false,
        code: 'missing_surface_or_connection_lookup',
        reason: 'SurfaceConnection requires SurfaceLookup and ConnectionLookup.',
        context: { SurfaceLookup: sLookup, ConnectionLookup: cLookup },
      };
    }
    const surface = eac.Surfaces?.[sLookup];
    if (!surface) {
      return {
        valid: false,
        code: 'unknown_surface',
        reason: 'Surface lookup not found in workspace EaC.',
        context: { SurfaceLookup: sLookup },
      };
    }
    if (!surface.DataConnections?.[cLookup]) {
      return {
        valid: false,
        code: 'unknown_surface_connection',
        reason: 'Connection not found under the specified surface.',
        context: { SurfaceLookup: sLookup, ConnectionLookup: cLookup },
      };
    }
    return { valid: true };
  }

  if (impulse.Source === 'SurfaceSchema') {
    const sLookup = impulse.Metadata?.SurfaceLookup;
    const schLookup = impulse.Metadata?.SchemaLookup;
    if (!sLookup || !schLookup) {
      return {
        valid: false,
        code: 'missing_surface_or_schema_lookup',
        reason: 'SurfaceSchema requires SurfaceLookup and SchemaLookup.',
        context: { SurfaceLookup: sLookup, SchemaLookup: schLookup },
      };
    }
    const surface = eac.Surfaces?.[sLookup];
    if (!surface) {
      return {
        valid: false,
        code: 'unknown_surface',
        reason: 'Surface lookup not found in workspace EaC.',
        context: { SurfaceLookup: sLookup },
      };
    }
    if (!surface.Schemas?.[schLookup]) {
      return {
        valid: false,
        code: 'unknown_surface_schema',
        reason: 'Schema not found under the specified surface.',
        context: { SurfaceLookup: sLookup, SchemaLookup: schLookup },
      };
    }
    return { valid: true };
  }

  if (impulse.Source === 'SurfaceAgent') {
    const sLookup = impulse.Metadata?.SurfaceLookup;
    const aLookup = impulse.Metadata?.AgentLookup;
    const mSchema = impulse.Metadata?.MatchedSchemaLookup;
    if (!sLookup || !aLookup || !mSchema) {
      return {
        valid: false,
        code: 'missing_surface_agent_or_matched_schema',
        reason: 'SurfaceAgent requires SurfaceLookup, AgentLookup, and MatchedSchemaLookup.',
        context: {
          SurfaceLookup: sLookup,
          AgentLookup: aLookup,
          MatchedSchemaLookup: mSchema,
        },
      };
    }
    const surface = eac.Surfaces?.[sLookup];
    if (!surface) {
      return {
        valid: false,
        code: 'unknown_surface',
        reason: 'Surface lookup not found in workspace EaC.',
        context: { SurfaceLookup: sLookup },
      };
    }
    if (!surface.Agents?.[aLookup]) {
      return {
        valid: false,
        code: 'unknown_surface_agent',
        reason: 'Agent not found under the specified surface.',
        context: { SurfaceLookup: sLookup, AgentLookup: aLookup },
      };
    }
    if (!eac.Schemas?.[mSchema]) {
      return {
        valid: false,
        code: 'unknown_matched_schema',
        reason: 'Matched schema lookup not found in workspace EaC.',
        context: { MatchedSchemaLookup: mSchema },
      };
    }
    return { valid: true };
  }

  if (impulse.Source === 'SurfaceWarmQuery') {
    const sLookup = impulse.Metadata?.SurfaceLookup;
    const wqLookup = impulse.Metadata?.WarmQueryLookup;
    if (!sLookup || !wqLookup) {
      return {
        valid: false,
        code: 'missing_surface_or_warmquery_lookup',
        reason: 'SurfaceWarmQuery requires SurfaceLookup and WarmQueryLookup.',
        context: { SurfaceLookup: sLookup, WarmQueryLookup: wqLookup },
      };
    }
    // TODO(kbowers): When WarmQuery metadata is formalized, validate using eac.Surfaces
    return { valid: true };
  }

  if (impulse.Source === 'Signal') {
    const sig = impulse.Metadata?.SignalLookup;
    const trig = impulse.Metadata?.TriggeringAgentLookup;
    if (!sig || !trig) {
      return {
        valid: false,
        code: 'missing_signal_or_triggering_agent',
        reason: 'Signal requires SignalLookup and TriggeringAgentLookup.',
        context: { SignalLookup: sig, TriggeringAgentLookup: trig },
      };
    }
    return { valid: true };
  }

  if (impulse.Source === 'System') {
    return { valid: true };
  }

  return {
    valid: false,
    code: 'unknown_source',
    reason: `Unsupported impulse source: ${String((impulse as any)?.Source)}`,
  };
}

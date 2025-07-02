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

type ImpulseRuntime = {
  AddWebSocketListener: (cb: (impulse: RuntimeImpulse) => void) => () => void;
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
    pipeline.Append(establishImpulseRuntime(impulseRuntimeCache, logger));
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

    return await handleImpulseStreamConnection({
      req,
      impulseRuntimeCache,
      logger,
      workspace,
      surfaceFilter,
      schemaFilter,
    });
    // return establishWebSocketOnly(req, logger);
  }) as EaCRuntimeHandler;
}

function establishImpulseRuntime(
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
          workspace,
          surfaceFilter,
          JetStream,
          jsm: JetStreamManager,
          SC,
          logger,
        }),
      );
    }

    return Next();
  }) as EaCRuntimeHandler;
}

async function createImpulseRuntime({
  workspace,
  surfaceFilter,
  JetStream,
  jsm,
  SC,
  logger,
}: {
  workspace: string;
  surfaceFilter?: string;
  JetStream: JetStreamClient;
  jsm: JetStreamManager;
  SC: Codec<string>;
  logger: Logger;
}): Promise<ImpulseRuntime> {
  const listeners = new Set<(imp: RuntimeImpulse) => void>();
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
      true,
    );
  } else {
    await ensureWorkspaceJetStreamBuilder(jsm, workspace, jsmDefaults, true);
  }

  logger.info('[ImpulseStream] ✅ Stream ensured, creating consumer');

  const { stop } = await createEphemeralConsumer(
    JetStream,
    jsm,
    stream,
    subject,
    ({ subject, data, headers }) => {
      try {
        logger.debug('[ImpulseStream] 📥 Impulse received', { subject });
        const impulse: RuntimeImpulse = JSON.parse(SC.decode(data));

        headers?.forEach((val, key) => {
          impulse.Headers[key] = val;
        });

        listeners.forEach((cb) => cb(impulse));
      } catch (err) {
        logger.warn('[ImpulseStream] ⚠️ Failed to parse impulse', err);
      }
    },
    {
      deliver_policy: DeliverPolicy.StartTime,
      opt_start_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  );

  let closed = false;
  let refCount = 0;

  return {
    AddWebSocketListener: (cb) => {
      logger.info('[ImpulseStream] 🔗 Listener added');
      listeners.add(cb);
      refCount++;
      return () => {
        if (!listeners.has(cb)) return;
        listeners.delete(cb);
        refCount = Math.max(0, refCount - 1);
        logger.info('[ImpulseStream] ❌ Listener removed');
        if (refCount <= 0 && !closed) {
          closed = true;
          try {
            stop();
          } catch (err) {
            logger.warn('[ImpulseStream] ⚠️ Error stopping consumer', err);
          }
          logger.info('[ImpulseStream] 🛑 Consumer stopped');
        }
      };
    },
    Close: () => {
      if (closed) return;
      closed = true;
      try {
        stop();
      } catch (err) {
        logger.warn('[ImpulseStream] ⚠️ Error stopping consumer', err);
      }
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
  let socketReady = false;
  const impulseQueue: RuntimeImpulse[] = [];

  const flushQueue = () => {
    logger.debug(`[WS] 🚚 Flushing ${impulseQueue.length} queued impulses`);
    while (
      socketReady &&
      socket.readyState === WebSocket.OPEN &&
      impulseQueue.length > 0
    ) {
      const imp = impulseQueue.shift();
      if (imp) {
        try {
          socket.send(JSON.stringify(imp));
        } catch (err) {
          logger.error('[WS] ❌ Failed to send impulse:', err);
        }
      }
    }
  };

  const listener = (impulse: RuntimeImpulse) => {
    logger.debug(`[WS] 🎯 Impulse received by listener: ${impulse.Subject}`);

    if (!impulseMatchesFilter(impulse, surfaceFilter, schemaFilter)) {
      logger.debug('[WS] 🚫 Impulse filtered out');
      return;
    }

    if (socketReady && socket.readyState === WebSocket.OPEN) {
      logger.debug(
        `[WS] ✅ Sending impulse to open socket: ${impulse.Subject}`,
      );
      try {
        socket.send(JSON.stringify(impulse));
      } catch (err) {
        logger.error('[WS] ❌ Send failed:', err);
      }
    } else {
      logger.warn(
        `[WS] ⏳ Socket not open — queueing impulse: ${impulse.Subject}`,
      );
      impulseQueue.push(impulse);
    }
  };

  const cacheKey = `${workspace}::${surfaceFilter ?? '*'}`;

  const runtime = await impulseRuntimeCache.get(cacheKey)!;

  async function shutdown() {
    if (closed) return;
    closed = true;
    socketReady = false;
    impulseQueue.length = 0;
    logger.info('[WS] 🔻 Shutting down stream connection');
    unsub?.();
    await runtime.Close();
    impulseRuntimeCache.delete(cacheKey);
  }

  socket.onopen = () => {
    if (socketReady) {
      logger.warn('[WS] 🚨 Socket already marked as ready — duplicate onopen?');
      return;
    }

    logger.info(`[WS] ✅ WebSocket opened: workspace=${workspace}`);
    socketReady = true;

    if (!unsub) {
      unsub = runtime.AddWebSocketListener(listener);
    } else {
      logger.warn('[WS] ⚠️ Listener already attached — skipping');
    }

    setTimeout(() => {
      socket.send(
        JSON.stringify({ status: 'connected', ts: new Date().toISOString() }),
      );
      flushQueue();
    }, 0);
  };

  socket.onmessage = (event) => {
    logger.info('[WS-Only] 📥 Received message:', event.data);
    socket.send(JSON.stringify({ echo: event.data }));
  };

  socket.onclose = (event) => {
    logger.warn('[WS] 🔻 WebSocket closed:', event.reason || '(no reason)');
    shutdown();
  };

  socket.onerror = async (err) => {
    logger.error('[WS] ❌ WebSocket error:', err);
    await shutdown();
  };

  return response;
}

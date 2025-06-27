import {
  EaCApplicationProcessorConfig,
  EaCRuntimeContext,
  EaCRuntimeHandler,
  getPackageLogger,
  IoCContainer,
  ProcessorHandlerResolver,
  Logger,
  JetStreamClient,
  JetStreamManager,
  Codec,
  EaCRuntimeHandlerPipeline,
  establishJwtValidationMiddleware,
  loadJwtConfig,
} from '../.deps.ts';
import {
  NATSContext,
  connectNATSMiddleware,
} from '../../api/middlewares/connectNATSMiddleware.ts';
import { OpenIndustrialJWTPayload } from '../../types/OpenIndustrialJWTPayload.ts';
import { RuntimeImpulse } from '../../types/RuntimeImpulse.ts';
import { buildNATSSubject } from '../../utils/buildNATSSubject.ts';
import { createEphemeralConsumer } from '../../utils/createEphemeralConsumer.ts';
import { parseNATSImpulseSubject } from '../../utils/parseNATSImpulseSubject.ts';
import { ensureJetStreamStream } from '../../utils/ensureJetStreamStream.ts';
import { isEaCOIImpulseStreamProcessor } from './EaCOIImpulseStreamProcessor.ts';
import { RetentionPolicy } from 'npm:nats@2.29.2';

type ImpulseRuntime = {
  AddWebSocketListener: (cb: (impulse: RuntimeImpulse) => void) => () => void;
  Close: () => Promise<void>;
};

export const EaCOIImpulseStreamProcessorHandlerResolver: ProcessorHandlerResolver =
  {
    async Resolve(_ioc, appProcCfg, _eac): Promise<EaCRuntimeHandler> {
      const logger = await getPackageLogger(import.meta);
      const proc = appProcCfg.Application.Processor;

      if (!isEaCOIImpulseStreamProcessor(proc)) {
        throw new Deno.errors.NotSupported(
          'Invalid EaCOIImpulseStreamProcessor configuration.'
        );
      }

      logger.info('[ImpulseStream] ✅ Processor initialized using shared NATS');

      const impulseRuntimeCache = new Map<string, Promise<ImpulseRuntime>>();
      const pipeline = new EaCRuntimeHandlerPipeline();

      pipeline.Append(establishJwtValidationMiddleware(loadJwtConfig()));
      pipeline.Append(connectNATSMiddleware() as EaCRuntimeHandler);
      // pipeline.Append(establishImpulseRuntime(impulseRuntimeCache, logger));
      // pipeline.Append(streamImpulses(impulseRuntimeCache, logger));
      pipeline.Append(establishWebSocketOnly(logger));

      return (req, ctx) => pipeline.Execute(req, ctx);
    },
  };

function establishWebSocketOnly(logger: Logger): EaCRuntimeHandler {
  return (async (
    req,
    { Runtime }: EaCRuntimeContext<OpenIndustrialJWTPayload>
  ) => {
    logger.info('[WS-Only] 🔧 Attempting WebSocket upgrade...');

    if (req.headers.get('upgrade')?.toLowerCase() !== 'websocket') {
      logger.warn('[WS-Only] ❌ Not a WebSocket upgrade request');
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = () => {
      logger.info('[WS-Only] ✅ WebSocket opened');
      socket.send(
        JSON.stringify({ status: 'connected', ts: new Date().toISOString() })
      );
    };

    socket.onmessage = (event) => {
      logger.info('[WS-Only] 📥 Received message:', event.data);
      socket.send(JSON.stringify({ echo: event.data }));
    };

    socket.onerror = (err) => {
      logger.error('[WS-Only] ❌ WebSocket error:', err);
    };

    socket.onclose = (evt) => {
      logger.warn(`[WS-Only] 🔻 Closed: ${evt.reason || '(no reason)'}`);
    };

    return response;
  }) as EaCRuntimeHandler;
}

function streamImpulses(
  impulseRuntimeCache: Map<string, Promise<ImpulseRuntime>>,
  logger: Logger
): EaCRuntimeHandler {
  return (async (
    req,
    {
      Runtime,
      State,
    }: EaCRuntimeContext<OpenIndustrialJWTPayload & NATSContext>
  ) => {
    const { WorkspaceLookup: workspace } = State;

    const surfaceFilter =
      Runtime.URLMatch.SearchParams?.get('surface') ?? undefined;
    const schemaFilter =
      Runtime.URLMatch.SearchParams?.get('schema') ?? undefined;

    const cacheKey = `${workspace}::${surfaceFilter ?? '*'}`;

    const runtime = await impulseRuntimeCache.get(cacheKey)!;
    const { socket, response } = Deno.upgradeWebSocket(req);

    logger.info('[ImpulseStream] 🔌 WebSocket upgrade complete');

    return handleImpulseStreamConnection({
      socket,
      response,
      runtime,
      logger,
      workspace,
      surfaceFilter,
      schemaFilter,
    });
  }) as EaCRuntimeHandler;
}

function establishImpulseRuntime(
  impulseRuntimeCache: Map<string, Promise<ImpulseRuntime>>,
  logger: Logger
): EaCRuntimeHandler {
  return (async (
    req,
    {
      Runtime,
      State,
      Next,
    }: EaCRuntimeContext<OpenIndustrialJWTPayload & NATSContext>
  ) => {
    const { NATS, WorkspaceLookup: workspace } = State;
    const { JetStream, JetStreamManager, SC } = NATS;

    if (!workspace) {
      logger.error('[ImpulseStream] ❌ Missing workspace');
      return new Response('Missing workspace parameter', { status: 400 });
    }

    const surfaceFilter =
      Runtime.URLMatch.SearchParams?.get('surface') ?? undefined;

    logger.info(
      `[ImpulseStream] 🔍 Preparing stream for workspace: ${workspace}, surface: ${
        surfaceFilter ?? '*'
      }`
    );

    const cacheKey = `${workspace}::${surfaceFilter ?? '*'}`;

    if (!impulseRuntimeCache.has(cacheKey)) {
      logger.debug(
        `[ImpulseStream] 🆕 Creating new impulse runtime: ${cacheKey}`
      );
      impulseRuntimeCache.set(
        cacheKey,
        createImpulseRuntime({
          workspace,
          surfaceFilter,
          JetStream,
          JetStreamManager,
          SC,
          logger,
        })
      );
    }

    return Next();
  }) as EaCRuntimeHandler;
}

function createImpulseRuntime({
  workspace,
  surfaceFilter,
  JetStream,
  JetStreamManager,
  SC,
  logger,
}: {
  workspace: string;
  surfaceFilter?: string;
  JetStream: JetStreamClient;
  JetStreamManager: JetStreamManager;
  SC: Codec<string>;
  logger: Logger;
}): Promise<ImpulseRuntime> {
  return (async () => {
    const listeners = new Set<(imp: RuntimeImpulse) => void>();

    const subject = buildNATSSubject(workspace, surfaceFilter);
    const stream = `workspace.${workspace}${
      surfaceFilter ? `.surface.${surfaceFilter}` : ''
    }`;

    logger.info(`[ImpulseStream] 🧩 Stream: ${stream}`);
    logger.info(`[ImpulseStream] 📛 Subject: ${subject}`);

    await ensureJetStreamStream(JetStreamManager, stream, [subject], {
      max_msgs_per_subject: 1000,
      retention: RetentionPolicy.Limits,
      max_age: 0,
    });

    logger.info(
      '[ImpulseStream] ✅ Stream ensured, creating ephemeral consumer...'
    );

    const { stop } = await createEphemeralConsumer(
      JetStream,
      JetStreamManager,
      stream,
      subject,
      ({ subject, data, headers }) => {
        try {
          logger.debug(`[ImpulseStream] 📥 Received impulse on: ${subject}`);
          const payload = JSON.parse(SC.decode(data));
          const impulse = parseNATSImpulseSubject(subject, payload, headers);
          listeners.forEach((cb) => cb(impulse));
        } catch (err) {
          logger.warn('[ImpulseStream] ⚠️ Error parsing impulse:');
          logger.warn(err);
        }
      }
    );

    let closed = false;
    let refCount = 0;

    return {
      AddWebSocketListener: (cb) => {
        logger.info('[ImpulseStream] 🔗 Listener added');
        listeners.add(cb);
        refCount++;
        return () => {
          listeners.delete(cb);
          refCount--;
          logger.info('[ImpulseStream] ❌ Listener removed');
          if (refCount <= 0 && !closed) {
            closed = true;
            stop();
            logger.info('[ImpulseStream] 🛑 Consumer stopped');
          }
        };
      },
      Close: async () => {
        if (closed) return;
        closed = true;
        stop();
        logger.info('[ImpulseStream] 🔒 Runtime closed');
      },
    };
  })();
}

function impulseMatchesFilter(
  impulse: RuntimeImpulse,
  surface?: string,
  schema?: string
): boolean | undefined {
  const meta = impulse.Metadata;
  const matchesSurface =
    !surface ||
    (meta && 'SurfaceLookup' in meta && meta.SurfaceLookup === surface);
  const matchesSchema =
    !schema || (meta && 'SchemaLookup' in meta && meta.SchemaLookup === schema);
  return matchesSurface && matchesSchema;
}

function handleImpulseStreamConnection({
  socket,
  response,
  runtime,
  logger,
  workspace,
  surfaceFilter,
  schemaFilter,
}: {
  socket: WebSocket;
  response: Response;
  runtime: ImpulseRuntime;
  logger: Logger;
  workspace: string;
  surfaceFilter?: string;
  schemaFilter?: string;
}): Response {
  let check = false;
  const listener = (impulse: RuntimeImpulse) => {
    if (!check) {
      debugger;
      check = true;
    }
    logger.debug('[WS] 🎯 Impulse received by listener');
    if (impulseMatchesFilter(impulse, surfaceFilter, schemaFilter)) {
      logger.debug('[WS] ✅ Impulse passed filter check — sending to socket');
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(impulse));
      } else {
        logger.warn('[WS] ⚠️ Tried to send before socket was open');
      }
    } else {
      logger.debug('[WS] 🚫 Impulse filtered out');
    }
  };

  let unsub: () => void;
  let closed = false;

  async function shutdown() {
    // if (closed) return;
    // closed = true;
    // logger.info('[WS] 🔻 Shutting down stream connection');
    // unsub?.();
    // await runtime.Close();
  }

  socket.onopen = () => {
    logger.info(`[WS] 🔐 Client connected: workspace=${workspace}`);
    // unsub = runtime.AddWebSocketListener(listener);
  };

  socket.onclose = (event) => {
    logger.warn('[WS] 🔻 WebSocket closed by client');
    logger.warn(event);
    // shutdown();
  };

  socket.onerror = async (err) => {
    debugger;
    // logger.error('[WS] ❌ WebSocket error:');
    // logger.error(err);
    // await shutdown();
  };

  return response;
}

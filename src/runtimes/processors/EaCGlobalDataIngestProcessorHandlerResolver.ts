// deno-lint-ignore-file no-explicit-any
import { buildRuntimeImpulseForSubject } from '../../utils/buildRuntimeImpulseForSubject.ts';
import { ensureWorkspaceJetStreamBuilder } from '../../utils/ensureWorkspaceJetStream.ts';
import {
  connect,
  EaCApplicationProcessorConfig,
  EaCRuntimeHandler,
  EventHubConsumerClient,
  getPackageLogger,
  IoCContainer,
  IoTRegistry,
  JetStreamClient,
  JetStreamManager,
  Logger,
  NatsConnection,
  ProcessorHandlerResolver,
  StringCodec,
  Twin,
} from '../.deps.ts';

import {
  EaCGlobalDataIngestProcessor,
  isEaCGlobalDataIngestProcessor,
} from './EaCGlobalDataIngestProcessor.ts';

export const EaCGlobalDataIngestProcessorHandlerResolver: ProcessorHandlerResolver = {
  async Resolve(
    _ioc: IoCContainer,
    appProcCfg: EaCApplicationProcessorConfig,
    _eac,
  ): Promise<EaCRuntimeHandler> {
    const logger = await getPackageLogger(import.meta);
    const proc = appProcCfg.Application.Processor;

    if (!isEaCGlobalDataIngestProcessor(proc)) {
      throw new Deno.errors.NotSupported(
        'Expected a valid EaCGlobalDataIngestProcessor configuration.',
      );
    }

    const requiredOptions: Record<string, unknown> = {
      EventHubName: proc.EventHubName,
      EventHubConsumerConnectionString: proc.EventHubConsumerConnectionString,
      IoTHubConnectionString: proc.IoTHubConnectionString,
      NATSServer: proc.NATSServer,
      NATSToken: proc.NATSToken,
    };

    for (const [key, value] of Object.entries(requiredOptions)) {
      if (!value) {
        const msg =
          `Missing required processor option '${key}'. Please verify your EaCGlobalDataIngestProcessor configuration.`;
        logger.error(msg);
        throw new Error(msg);
      }
    }

    logger.info(
      `🔧 Starting global data ingest from Event Hub: ${proc.EventHubName}`,
    );

    try {
      const nc = await connect({
        servers: proc.NATSServer,
        token: proc.NATSToken,
      });

      logger.info(`✅ Connected to NATS at ${proc.NATSServer}`);

      await startEventHubConsumer(proc, nc, logger);
    } catch (err) {
      logger.error(err);
    }

    return (_req, _ctx) =>
      Promise.resolve(
        new Response('Global Data Ingest processor is active.', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        }),
      );
  },
};

// -----------------------------
// 🔧 HELPER FUNCTIONS
// -----------------------------

async function startEventHubConsumer(
  proc: EaCGlobalDataIngestProcessor,
  nc: NatsConnection,
  logger: Logger,
) {
  const registry = IoTRegistry.fromConnectionString(
    proc.IoTHubConnectionString,
  );
  const sc = StringCodec();
  const consumerGroup = proc.ConsumerGroup ?? '$Default';
  const client = new EventHubConsumerClient(
    consumerGroup,
    proc.EventHubConsumerConnectionString,
    // {
    //   webSocketOptions: {},
    //   amqpConnectionOptions: {
    //     idleTimeoutInMs: 60_000,
    //   },
    // },
  );

  const js = nc.jetstream(); // ✅ JetStream client for deduplication
  const jsm = await nc.jetstreamManager();

  logger.info(`🔁 Subscribing to Event Hub partitions...`);

  const initializedStreams = new Set<string>();

  const handlers = {
    async processEvents(events: any[]) {
      for (const evt of events) {
        const deviceId = evt.systemProperties?.['iothub-connection-device-id'];
        const payload = evt.body;

        if (!deviceId || !payload) continue;

        try {
          const { responseBody: twin } = await registry.getTwin(deviceId);
          const entLookup = resolveTag(twin, 'WorkspaceLookup');
          const connLookup = resolveTag(twin, 'DataConnectionLookup');

          if (!entLookup || !connLookup) {
            logger.warn(
              `⚠️ Device ${deviceId} missing ent/data tags — skipping.`,
            );
            continue;
          }

          await forwardEventToJetStream(
            entLookup,
            connLookup,
            payload,
            evt.systemProperties || {},
            js,
            jsm,
            sc,
            proc,
            logger,
            initializedStreams,
          );
        } catch (err) {
          logger.error(`❌ Error resolving device twin for ${deviceId}`);
          logger.error(err);
        }
      }
    },
    processError(err: unknown) {
      logger.error('❌ EventHub processing error:');
      logger.error(err);
      return Promise.resolve();
    },
  };

  let attempt = 0;
  const maxAttempts = 3;
  while (true) {
    try {
      client.subscribe(handlers);
      break;
    } catch (err) {
      attempt++;
      logger.error('❌ EventHub subscribe error:');
      logger.error(err);
      if (attempt > maxAttempts) {
        throw err;
      }
      const backoff = 2 ** attempt * 1_000;
      logger.warn(`🔁 Retrying Event Hub subscribe in ${backoff}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
}

async function forwardEventToJetStream(
  entLookup: string,
  connLookup: string,
  payload: Record<string, unknown>,
  systemProperties: Record<string, string>,
  js: JetStreamClient,
  jsm: JetStreamManager,
  sc: ReturnType<typeof StringCodec>,
  proc: EaCGlobalDataIngestProcessor,
  logger: Logger,
  initializedStreams: Set<string>,
) {
  const stream = `workspace.${entLookup}.connection.${connLookup}`;
  const subject = `${stream}.impulse`;

  await ensureWorkspaceJetStreamBuilder(
    jsm,
    entLookup,
    proc.JetStreamDefaults,
    !initializedStreams.has(stream),
  );

  initializedStreams.add(stream);

  const impulse = buildRuntimeImpulseForSubject(
    subject,
    payload,
    systemProperties,
  );

  // ✅ Deduplicated publish using JetStream + msgID
  await js.publish(subject, sc.encode(JSON.stringify(impulse)), {
    msgID: impulse.ID,
  });

  logger.debug(`📤 Forwarded impulse ${impulse.ID} → ${subject}`);
}

function resolveTag(twin: Twin, key: string): string | undefined {
  return twin?.tags?.[key] ?? twin?.properties?.desired?.[key];
}

import { ensureJetStreamStream } from '../../utils/ensureJetStreamStream.ts';
import {
  connect,
  EaCApplicationProcessorConfig,
  EaCRuntimeHandler,
  EventHubConsumerClient,
  getPackageLogger,
  IoCContainer,
  IoTRegistry,
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

    logger.info(
      `🔧 Starting global data ingest from Event Hub: ${proc.EventHubName}`,
    );

    try {
      const nc = await connect({ servers: proc.NATSServer });

      logger.info(`✅ Connected to NATS at ${proc.NATSServer}`);

      await startEventHubConsumer(proc, nc, logger);
    } catch (err) {
      // debugger;
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
  // debugger;
  const registry = IoTRegistry.fromConnectionString(
    proc.IoTHubConnectionString,
  );

  const sc = StringCodec();

  const consumerGroup = proc.ConsumerGroup ?? '$Default';

  const client = new EventHubConsumerClient(
    consumerGroup,
    proc.EventHubConsumerConnectionString,
  );

  logger.info(`🔁 Subscribing to Event Hub partitions...`);

  const jsm = await nc.jetstreamManager();

  client.subscribe({
    async processEvents(events) {
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
            jsm,
            nc,
            sc,
            proc,
            logger,
          );
        } catch (err) {
          logger.error(`❌ Error resolving device twin for ${deviceId}`, err);
        }
      }
    },
    processError(err) {
      logger.error('❌ EventHub processing error:', err);

      return Promise.resolve();
    },
  });
}

async function forwardEventToJetStream(
  entLookup: string,
  connLookup: string,
  payload: unknown,
  jsm: JetStreamManager,
  nc: NatsConnection,
  sc: ReturnType<typeof StringCodec>,
  proc: EaCGlobalDataIngestProcessor,
  logger: Logger,
) {
  const stream = `workspace.${entLookup}.data-connection.${connLookup}`;
  const subject = `${stream}.impulse`;

  await ensureJetStreamStream(jsm, stream, [subject], proc.JetStreamDefaults);

  nc.publish(subject, sc.encode(JSON.stringify(payload)));

  logger.debug(`📤 ${subject} ← ${JSON.stringify(payload)}`);
}

function resolveTag(twin: Twin, key: string): string | undefined {
  return twin?.tags?.[key] ?? twin?.properties?.desired?.[key];
}

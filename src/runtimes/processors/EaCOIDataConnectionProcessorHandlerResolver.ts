import {
  connect,
  EaCApplicationProcessorConfig,
  EaCRuntimeHandler,
  getPackageLogger,
  IoCContainer,
  JetStreamManager,
  Logger,
  NatsConnection,
  ProcessorHandlerResolver,
  StringCodec,
  Subscription,
} from '../.deps.ts';
import { ensureJetStreamStream } from '../../utils/ensureJetStreamStream.ts';
import { isEaCOIDataConnectionProcessor } from './EaCOIDataConnectionProcessor.ts';

/**
 * Surface-level processor that scopes workspace data connection telemetry
 * into a surface-bound NATS subject for downstream schema/agent execution.
 */
export const EaCOIDataConnectionProcessorHandlerResolver: ProcessorHandlerResolver = {
  async Resolve(
    _ioc: IoCContainer,
    appProcCfg: EaCApplicationProcessorConfig,
    eac,
  ): Promise<EaCRuntimeHandler> {
    const logger = await getPackageLogger(import.meta);
    const proc = appProcCfg.Application.Processor;

    if (!isEaCOIDataConnectionProcessor(proc)) {
      throw new Deno.errors.NotSupported(
        'Expected a valid EaCOIDataConnectionProcessor configuration.',
      );
    }

    const surface = proc.SurfaceLookup;
    const dataConn = proc.DataConnectionLookup;

    logger.info(
      `🟢 [${surface}/${dataConn}] Initializing surface data connection processor`,
    );

    // Step 1: Connect to NATS
    const nc: NatsConnection = await connect({
      servers: proc.NATSServer,
      token: proc.NATSToken,
    });
    const sc = StringCodec();
    const jsm: JetStreamManager = await nc.jetstreamManager();

    logger.info(
      `🔌 [${surface}/${dataConn}] Connected to NATS at ${proc.NATSServer}`,
    );

    // Step 2: Define routing subjects
    const sourceSubject = `workspace.${eac.EnterpriseLookup}.data-connection.${dataConn}.impulse`;
    const streamName =
      `workspace.${eac.EnterpriseLookup}.surface.${surface}.data-connection.${dataConn}`;
    const targetSubject = `${streamName}.impulse`;

    logger.info(
      `📥 [${surface}/${dataConn}] Subscribing to source subject: ${sourceSubject}`,
    );
    logger.info(
      `📤 [${surface}/${dataConn}] Forwarding to surface subject: ${targetSubject}`,
    );
    logger.debug(`🧭 Stream name: ${streamName}`);

    // Step 3: Create JetStream stream if missing
    await ensureJetStreamStream(
      jsm,
      streamName,
      [targetSubject],
      proc.JetStreamDefaults,
    );
    logger.info(
      `📦 [${surface}/${dataConn}] JetStream stream ensured: ${streamName}`,
    );

    // Step 4: Subscribe and forward
    const sub: Subscription = nc.subscribe(sourceSubject);
    (async () => {
      for await (const msg of sub) {
        forwardToSurfaceSubject(
          msg.data,
          targetSubject,
          nc,
          sc,
          logger,
          surface,
          dataConn,
        );
      }
    })();

    // Step 5: Return handler
    return (_req, _ctx) =>
      Promise.resolve(
        new Response('Surface DataConnection processor is active.', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        }),
      );
  },
};

// -----------------------------
// 🔧 HELPER FUNCTIONS
// -----------------------------

function forwardToSurfaceSubject(
  data: Uint8Array,
  subject: string,
  nc: NatsConnection,
  sc: ReturnType<typeof StringCodec>,
  logger: Logger,
  surface: string,
  dataConn: string,
) {
  nc.publish(subject, data);
  logger.info(`📤 [${surface}/${dataConn}] ${subject} ← ${sc.decode(data)}`);
}

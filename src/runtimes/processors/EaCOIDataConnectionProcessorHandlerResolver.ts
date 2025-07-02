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

import { isEaCOIDataConnectionProcessor } from './EaCOIDataConnectionProcessor.ts';
import type { RuntimeImpulse } from '../../types/RuntimeImpulse.ts';
import { ensureWorkspaceSurfaceJetStream } from '../../utils/ensureWorkspaceSurfaceJetStream.ts';

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

    const nc: NatsConnection = await connect({
      servers: proc.NATSServer,
      token: proc.NATSToken,
    });

    const sc = StringCodec();
    const js = nc.jetstream(); // ✅ JetStream publish
    const jsm: JetStreamManager = await nc.jetstreamManager();

    logger.info(
      `🔌 [${surface}/${dataConn}] Connected to NATS at ${proc.NATSServer}`,
    );

    const sourceSubject = `workspace.${eac.EnterpriseLookup}.connection.${dataConn}.impulse`;
    const targetSubject =
      `workspace.${eac.EnterpriseLookup}.surface.${surface}.connection.${dataConn}.impulse`;

    logger.info(
      `📥 [${surface}/${dataConn}] Subscribing to: ${sourceSubject}`,
    );
    logger.info(
      `📤 [${surface}/${dataConn}] Forwarding to: ${targetSubject}`,
    );

    await ensureWorkspaceSurfaceJetStream(
      jsm,
      eac.EnterpriseLookup!,
      surface,
      proc.JetStreamDefaults,
      true,
    );
    logger.info(
      `📦 [${surface}/${dataConn}] JetStream stream ensured: workspace.${eac.EnterpriseLookup}.surface.${surface}`,
    );

    const sub: Subscription = nc.subscribe(sourceSubject);
    (async () => {
      for await (const msg of sub) {
        forwardToSurfaceSubject(
          msg.data,
          targetSubject,
          js,
          sc,
          logger,
          surface,
          dataConn,
        );
      }
    })();

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
// 🔧 FORWARDER WITH msgID
// -----------------------------

async function forwardToSurfaceSubject(
  data: Uint8Array,
  subject: string,
  js: ReturnType<NatsConnection['jetstream']>,
  sc: ReturnType<typeof StringCodec>,
  logger: Logger,
  surface: string,
  dataConn: string,
) {
  try {
    const decoded = sc.decode(data);
    const impulse = JSON.parse(decoded) as RuntimeImpulse;

    if (!impulse?.ID) {
      logger.warn(
        `⚠️ [${surface}/${dataConn}] Skipped message: missing impulse ID`,
      );
      return;
    }

    await js.publish(subject, data, { msgID: impulse.ID });

    logger.debug(
      `📤 [${surface}/${dataConn}] Forwarded impulse ${impulse.ID} → ${subject}`,
    );
  } catch (err) {
    logger.error(`❌ [${surface}/${dataConn}] Error forwarding impulse`, err);
  }
}

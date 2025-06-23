import { EaCApplicationProcessorConfig } from 'jsr:@fathym/eac-applications@0.0.151/processors';
import { ProcessorHandlerResolver } from 'jsr:@fathym/eac-applications@0.0.151/runtime/processors';
import { IoCContainer } from 'jsr:@fathym/ioc@0.0.14';
import {
  connect,
  JetStreamManager,
  NatsConnection,
  StringCodec,
  Subscription,
} from 'npm:nats@2.29.2';
import { getPackageLogger } from 'jsr:@fathym/common@0.2.264/log';
import { EaCRuntimeHandler } from 'jsr:@fathym/eac@0.2.111/runtime/pipelines';
import { ensureJetStreamStream } from '../../utils/ensureJetStreamStream.ts';
import { isEaCOIDataConnectionProcessor } from './EaCOIDataConnectionProcessor.ts';
import { Logger } from '../.deps.ts';

/**
 * Surface-level processor that scopes workspace data connection telemetry
 * into a surface-bound NATS subject for downstream schema/agent execution.
 */
export const EaCOIDataConnectionProcessorHandlerResolver: ProcessorHandlerResolver = {
  async Resolve(
    ioc: IoCContainer,
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

    logger.debug(
      `🔧 Initializing surface data router for surface=${proc.SurfaceLookup}, data=${proc.DataConnectionLookup}`,
    );

    // Step 1: Connect to NATS
    const nc: NatsConnection = await connect({ servers: proc.NATSServer });
    const sc = StringCodec();
    const jsm: JetStreamManager = await nc.jetstreamManager();

    logger.debug(`✅ Connected to NATS at ${proc.NATSServer}`);

    ioc.Register(() => nc, {
      Type: ioc.Symbol('NatsConnection'),
    });

    // Step 2: Define routing subjects
    const sourceSubject =
      `workspace.${eac.EnterpriseLookup}.data-connection.${proc.DataConnectionLookup}.impulse`;
    const streamName =
      `workspace.${eac.EnterpriseLookup}.surface.${proc.SurfaceLookup}.data-connection.${proc.DataConnectionLookup}`;
    const targetSubject = `${streamName}.impulse`;

    logger.debug(`🔁 Subscribing to ${sourceSubject}`);
    logger.debug(`🔄 Forwarding to ${targetSubject}`);

    // Step 3: Create JetStream stream if missing
    await ensureJetStreamStream(
      jsm,
      streamName,
      [targetSubject],
      proc.JetStreamDefaults,
    );

    // Step 4: Subscribe and forward
    const sub: Subscription = nc.subscribe(sourceSubject);
    (async () => {
      for await (const msg of sub) {
        forwardToSurfaceSubject(msg.data, targetSubject, nc, sc, logger);
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
) {
  nc.publish(subject, data);
  logger.debug(`📤 ${subject} ← ${sc.decode(data)}`);
}

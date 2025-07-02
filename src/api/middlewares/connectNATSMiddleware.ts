import {
  Codec,
  connect,
  EaCRuntimeHandler,
  JetStreamClient,
  JetStreamManager,
  NatsConnection,
  StringCodec,
} from '../.deps.ts';

/**
 * Typed structure holding the connected NATS runtime clients.
 */
export type NATSContext = {
  NATS: {
    Conn: NatsConnection;
    JetStream: JetStreamClient;
    JetStreamManager: JetStreamManager;
    SC: Codec<string>;
  };
};

/**
 * Shared helper for connecting to NATS outside middleware use.
 */
export async function useNATS(): Promise<NATSContext['NATS']> {
  const natsURL = Deno.env.get('NATS_SERVER');
  const natsToken = Deno.env.get('NATS_TOKEN');

  if (!natsURL) {
    throw new Error('Missing NATS_SERVER environment variable');
  }

  const conn = await connect({
    servers: natsURL,
    token: natsToken,
  });

  const JetStream = conn.jetstream();
  const JetStreamManager = await conn.jetstreamManager();

  const sc = StringCodec();

  return { Conn: conn, JetStream, JetStreamManager, SC: sc };
}

/**
 * Middleware that attaches NATS clients to ctx.State
 */
export function connectNATSMiddleware(): EaCRuntimeHandler<NATSContext> {
  return async (_req, ctx) => {
    try {
      ctx.State.NATS = await useNATS();

      return ctx.Next();
    } catch (err) {
      console.error('[ConnectNATSMiddleware] Connection failed:', err);
      return new Response('Failed to connect to NATS', { status: 500 });
    }
  };
}

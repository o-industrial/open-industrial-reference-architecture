import { AckPolicy, ConsumerConfig, JetStreamClient, JetStreamManager } from './.deps.ts';
import { sanitizeStreamName } from './sanitizeStreamName.ts';

export async function createEphemeralConsumer(
  js: JetStreamClient,
  jsm: JetStreamManager,
  stream: string,
  subject: string,
  onMsg: (msg: {
    subject: string;
    data: Uint8Array;
    headers?: Headers;
  }) => void,
  consumerConfig?: Partial<ConsumerConfig>,
): Promise<{ stop: () => void }> {
  stream = sanitizeStreamName(stream);

  try {
    const info = await jsm.streams.info(stream);
    console.log(`[Stream Info] Subjects for stream ${stream}:`);
    console.log(info.config.subjects);
  } catch {
    throw new Error(`[ImpulseStream] Stream not found: ${stream}`);
  }

  const { name: consumerName } = await jsm.consumers.add(stream, {
    ack_policy: AckPolicy.None,
    filter_subject: subject,
    ...(consumerConfig || {}),
  });

  const consumer = await js.consumers.get(stream, consumerName);
  const abort = new AbortController();
  const messages = await consumer.consume();

  (async () => {
    for await (const msg of messages) {
      if (abort.signal.aborted) break;
      try {
        const headers = msg.headers ? new Headers() : undefined;

        if (headers && msg.headers) {
          for (const [key, value] of msg.headers) {
            headers.set(key, Array.isArray(value) ? value.join(', ') : value);
          }
        }

        onMsg({ subject: msg.subject, data: msg.data, headers });
      } catch (err) {
        console.warn('[ImpulseStream] Failed to process impulse:', err);
      }
    }
  })();

  return {
    stop: () => abort.abort(),
  };
}

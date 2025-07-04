import { JetStreamManager, RetentionPolicy, StorageType, StreamConfig } from './.deps.ts';
import { sanitizeStreamName } from './sanitizeStreamName.ts';

/**
 * Ensure a JetStream stream exists with safe, durable defaults for Open Industrial.
 *
 * If the stream already exists, it will be updated with the provided subjects and overrides.
 */
export async function ensureJetStreamStream(
  jsm: JetStreamManager,
  rawName: string,
  subjects: string[],
  overrides: Partial<StreamConfig> = {},
  withUpdate: boolean = false,
): Promise<void> {
  const name = sanitizeStreamName(rawName);

  const baseConfig: StreamConfig = {
    name,
    subjects,
    retention: RetentionPolicy.Limits,
    storage: StorageType.File,
    max_msgs: 10_000,
    max_age: 1000 * 60 * 60 * 24 * 7 * 1_000_000,
    duplicate_window: 60 * 1000 * 1_000_000,
    max_consumers: -1,
    allow_rollup_hdrs: true,
    consumer_limits: {
      inactive_threshold: 300 * 1000 * 1_000_000,
      max_ack_pending: 1000,
    },
    ...overrides,
  } as StreamConfig;

  let streamCreatedOrUpdated = false;

  try {
    await jsm.streams.info(name);
    if (withUpdate) {
      await jsm.streams.update(name, {
        ...baseConfig,
        subjects,
      });
      streamCreatedOrUpdated = true;
    }
  } catch {
    await jsm.streams.add(baseConfig);
    streamCreatedOrUpdated = true;
  }

  if (streamCreatedOrUpdated) {
    await waitForStreamReady(jsm, name);
  }
}

export async function waitForStreamReady(
  jsm: JetStreamManager,
  name: string,
  retries = 10,
  delayMs = 100
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await jsm.streams.info(name);
      if (info?.config?.subjects?.length > 0) {
        return; // Stream is fully registered and visible
      }
    } catch {
      // stream may not be ready yet
    }
    await new Promise((res) => setTimeout(res, delayMs));
  }
  throw new Error(`[JetStream] Stream ${name} not ready after retries`);
}

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
    max_age: 1000 * 60 * 60 * 24 * 7 * 1_000_000, // 7 days
    duplicate_window: 60 * 1000 * 1_000_000, // 60s
    max_consumers: -1,
    allow_rollup_hdrs: true,
    consumer_limits: {
      inactive_threshold: 300 * 1000 * 1_000_000, // 5 min
      max_ack_pending: 1000,
    },
    ...overrides,
  } as StreamConfig;

  try {
    await jsm.streams.info(name);

    if (withUpdate) {
      // Stream exists — update it
      await jsm.streams.update(name, {
        ...baseConfig,
        subjects,
      });
    }
  } catch {
    // Stream doesn't exist — create it
    await jsm.streams.add({
      ...baseConfig,
      name,
      subjects,
    });
  }
}

import {
  DiscardPolicy,
  JetStreamManager,
  RetentionPolicy,
  StorageType,
  StreamConfig,
} from './.deps.ts';

/**
 * Ensure a JetStream stream exists with safe, durable defaults for Open Industrial.
 *
 * Defaults:
 * - Retains up to 10,000 messages or 7 days
 * - File-backed persistent storage
 * - Discards oldest messages when limits are hit
 * - Deduplication window of 60s
 * - Allows rollup headers
 * - Stream is not sealed, not mirrored, and supports unlimited consumers
 */
export async function ensureJetStreamStream(
  jsm: JetStreamManager,
  rawName: string,
  subjects: string[],
  overrides?: Partial<StreamConfig>,
): Promise<void> {
  if (overrides === undefined) return;

  const name = sanitizeStreamName(rawName);

  try {
    await jsm.streams.info(name);
  } catch {
    const config: StreamConfig = {
      name,
      subjects,
      retention: RetentionPolicy.Limits,
      storage: StorageType.File,
      discard: DiscardPolicy.Old,
      max_msgs: 10_000,
      max_msgs_per_subject: -1,
      max_age: 1000 * 60 * 60 * 24 * 7,
      max_bytes: -1,
      max_msg_size: -1,
      max_consumers: -1,
      num_replicas: 1,
      sealed: false,
      first_seq: 0,
      discard_new_per_subject: false,
      no_ack: false,
      duplicate_window: 60 * 1000 * 1_000_000,
      allow_rollup_hdrs: true,
      allow_direct: false,
      mirror_direct: false,
      deny_delete: false,
      deny_purge: false,
      consumer_limits: {
        inactive_threshold: 300 * 1000 * 1_000_000,
        max_ack_pending: 1000,
      },
      ...overrides,
    };

    await jsm.streams.add(config);
  }
}

/**
 * Convert dot- and slash-based stream names to NATS-safe dash-separated names.
 */
function sanitizeStreamName(name: string): string {
  return name.replace(/[.\s\/]+/g, '-');
}

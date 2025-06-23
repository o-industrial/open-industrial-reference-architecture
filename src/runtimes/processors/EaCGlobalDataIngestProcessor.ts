import { EaCProcessor, isEaCProcessor, StreamConfig } from '../.deps.ts';

/**
 * Global processor for ingesting telemetry from Azure IoT Hub (via Event Hub-compatible endpoint).
 *
 * This processor:
 * - Connects once per environment to Azure IoT Event Hub endpoint.
 * - Handles all device messages across all tenants.
 * - Forwards messages to NATS JetStream per workspace+connection key.
 * - Automatically provisions JetStream streams using the provided or default configuration.
 */
export type EaCGlobalDataIngestProcessor = {
  /**
   * Azure Event Hub-compatible endpoint connection string.
   */
  EventHubConnectionString: string;

  /**
   * Name of the Event Hub (IoT Hub's fallback).
   */
  EventHubName: string;

  /**
   * The consumer group to use (default: `$Default`).
   */
  ConsumerGroup?: string;

  /**
   * NATS connection string.
   */
  NATSServer: string;

  /**
   * Optional base configuration to apply to each JetStream stream.
   * This is merged with internal defaults (e.g., retention, storage, replication).
   */
  JetStreamDefaults?: Partial<StreamConfig>;
} & EaCProcessor<'GlobalDataIngest'>;

/**
 * Type guard to validate an EaCGlobalDataIngestProcessor.
 */
export function isEaCGlobalDataIngestProcessor(
  proc: unknown,
): proc is EaCGlobalDataIngestProcessor {
  const x = proc as EaCGlobalDataIngestProcessor;

  return (
    isEaCProcessor('GlobalDataIngest', x) &&
    typeof x.EventHubConnectionString === 'string' &&
    typeof x.EventHubName === 'string' &&
    typeof x.NATSServer === 'string'
  );
}

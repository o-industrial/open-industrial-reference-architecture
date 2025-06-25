import { EaCProcessor, isEaCProcessor, StreamConfig } from '../.deps.ts';
import { EaCDataConnectionAsCode } from '../../eac/EaCDataConnectionAsCode.ts';

/**
 * Open Industrial Surface Data Connection Processor.
 *
 * This processor:
 * - Subscribes to workspace-level NATS telemetry from the global ingest.
 * - Re-publishes scoped messages under a surface-bound NATS subject.
 * - Enables surface schemas and agents to act on the telemetry stream.
 * - Optionally provisions JetStream streams for surface-scoped telemetry.
 */
export type EaCOIDataConnectionProcessor = {
  /**
   * The lookup key used to identify the configured data connection.
   * This should match a key in the `eac.DataConnections` map.
   */
  DataConnectionLookup: string;

  /**
   * The resolved configuration for the target data connection.
   * This should be validated prior to processor execution.
   */
  DataConnection: EaCDataConnectionAsCode;

  /**
   * The NATS server connection string used for publishing telemetry.
   * Example: "nats://localhost:4222"
   */
  NATSServer: string;

  /**
   * NATS token.
   */
  NATSToken?: string;

  /**
   * The surface this processor is associated with.
   * Used for namespacing telemetry subjects and resolving execution scope.
   */
  SurfaceLookup: string;

  /**
   * Optional JetStream stream configuration overrides.
   * These will be merged with system defaults during stream provisioning.
   */
  JetStreamDefaults?: Partial<StreamConfig>;
} & EaCProcessor<'OIDataConnection'>;

/**
 * Runtime type guard for identifying a valid `EaCOIDataConnectionProcessor`.
 *
 * @param proc - The unknown value to validate.
 * @returns `true` if the processor matches the expected type signature and required fields.
 */
export function isEaCOIDataConnectionProcessor(
  proc: unknown,
): proc is EaCOIDataConnectionProcessor {
  const x = proc as EaCOIDataConnectionProcessor;

  return (
    isEaCProcessor('OIDataConnection', x) &&
    typeof x.DataConnectionLookup === 'string' &&
    typeof x.NATSServer === 'string' &&
    typeof x.SurfaceLookup === 'string' &&
    !!x.DataConnection
  );
}

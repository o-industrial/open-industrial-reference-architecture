import { z } from './.deps.ts';
import { EaCSimulatorDetails, EaCSimulatorDetailsSchema } from './EaCSimulatorDetails.ts';

/**
 * Represents an Azure Docker-hosted simulator instance.
 *
 * This is the canonical container used to run the Azure IoT Device Telemetry Simulator:
 * https://learn.microsoft.com/en-us/samples/azure-samples/iot-telemetry-simulator/azure-iot-device-telemetry-simulator/
 */
export type EaCSharedSimulatorDetailsDetails = EaCSimulatorDetails<'AzureDocker'> & {
  /** JSON object defining variable values used in message templating. */
  Variables?: Record<string, unknown>;

  /** JSON object that serves as the telemetry message template. */
  MessageTemplate?: Record<string, unknown>;

  /** Delay between messages, in milliseconds. */
  MessageIntervalMS?: number;

  /** Total number of messages per device (0 = infinite). */
  MessageCountPerDevice?: number;
};

/**
 * Schema for EaCSharedSimulatorDetailsDetails.
 */
export const EaCSharedSimulatorDetailsDetailsSchema: z.ZodType<EaCSharedSimulatorDetailsDetails> =
  EaCSimulatorDetailsSchema.extend({
    Type: z.literal('AzureDocker'),
    Variables: z
      .record(z.unknown())
      .optional()
      .describe('JSON object for variable overrides in templates.'),
    MessageTemplate: z
      .record(z.unknown())
      .optional()
      .describe('JSON object defining the telemetry message format.'),
    MessageIntervalMS: z
      .number()
      .optional()
      .describe('Delay between messages in milliseconds.'),
    MessageCountPerDevice: z
      .number()
      .optional()
      .describe('Number of messages to send per device (0 = infinite).'),
  }).describe('Schema for Azure Docker-hosted simulator instance.');

/**
 * Type guard for EaCSharedSimulatorDetailsDetails.
 */
export function isEaCSharedSimulatorDetailsDetails(
  details: unknown,
): details is EaCSharedSimulatorDetailsDetails {
  return EaCSharedSimulatorDetailsDetailsSchema.safeParse(details).success;
}

/**
 * Validates and parses an object as EaCSharedSimulatorDetailsDetails.
 */
export function parseEaCSharedSimulatorDetailsDetails(
  details: unknown,
): EaCSharedSimulatorDetailsDetails {
  return EaCSharedSimulatorDetailsDetailsSchema.parse(details);
}

import { z } from './.deps.ts';
import { EaCSimulatorDetails, EaCSimulatorDetailsSchema } from './EaCSimulatorDetails.ts';

/**
 * Represents an Azure Docker-hosted simulator instance.
 *
 * This is the canonical container used to run the Azure IoT Device Telemetry Simulator:
 * https://learn.microsoft.com/en-us/samples/azure-samples/iot-telemetry-simulator/azure-iot-device-telemetry-simulator/
 */
export type EaCAzureDockerSimulatorDetails = EaCSimulatorDetails<'AzureDocker'> & {
  /**
   * Serialized JSON string defining variable values used in message templating.
   * Storing as a string ensures stable serialization and avoids merge ambiguity.
   */
  Variables?: string;

  /**
   * Serialized JSON string that serves as the telemetry message template.
   */
  MessageTemplate?: string;

  /** Delay between messages, in milliseconds. */
  MessageIntervalMS?: number;

  /** Total number of messages per device (0 = infinite). */
  MessageCountPerDevice?: number;
};

/**
 * Schema for EaCAzureDockerSimulatorDetails.
 */
export const EaCAzureDockerSimulatorDetailsSchema: z.ZodType<EaCAzureDockerSimulatorDetails> =
  EaCSimulatorDetailsSchema.extend({
    Type: z.literal('AzureDocker'),
    Variables: z
      .string()
      .optional()
      .describe('Serialized JSON for variable overrides in templates.'),
    MessageTemplate: z
      .string()
      .optional()
      .describe('Serialized JSON defining the telemetry message format.'),
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
 * Type guard for EaCAzureDockerSimulatorDetails.
 */
export function isEaCAzureDockerSimulatorDetails(
  details: unknown,
): details is EaCAzureDockerSimulatorDetails {
  return EaCAzureDockerSimulatorDetailsSchema.safeParse(details).success;
}

/**
 * Validates and parses an object as EaCAzureDockerSimulatorDetails.
 */
export function parseEaCAzureDockerSimulatorDetails(
  details: unknown,
): EaCAzureDockerSimulatorDetails {
  return EaCAzureDockerSimulatorDetailsSchema.parse(details);
}

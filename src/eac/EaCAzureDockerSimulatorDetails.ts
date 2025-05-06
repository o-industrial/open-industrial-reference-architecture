import { z } from './.deps.ts';
import { EaCSimulatorDetails, EaCSimulatorDetailsSchema } from './EaCSimulatorDetails.ts';

/**
 * Represents an Azure Docker-hosted simulator instance.
 *
 * This is the canonical container used to run the Azure IoT Device Telemetry Simulator:
 * https://learn.microsoft.com/en-us/samples/azure-samples/iot-telemetry-simulator/azure-iot-device-telemetry-simulator/
 */
export type EaCAzureDockerSimulatorDetails = EaCSimulatorDetails<'AzureDocker'> & {
  /** Number of devices to simulate. */
  DeviceCount?: number;

  /** Prefix used to generate device IDs. */
  DevicePrefix?: string;

  /** Starting index for simulated device IDs. */
  DeviceIndexOffset?: number;

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
 * Schema for EaCAzureDockerSimulatorDetails.
 */
export const EaCAzureDockerSimulatorDetailsSchema: z.ZodType<EaCAzureDockerSimulatorDetails> =
  EaCSimulatorDetailsSchema.extend({
    Type: z.literal('AzureDocker'),
    DeviceCount: z.number().optional().describe('Number of simulated devices.'),
    DevicePrefix: z
      .string()
      .optional()
      .describe('Prefix for simulated device IDs.'),
    DeviceIndexOffset: z
      .number()
      .optional()
      .describe('Starting index for simulated device IDs.'),
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

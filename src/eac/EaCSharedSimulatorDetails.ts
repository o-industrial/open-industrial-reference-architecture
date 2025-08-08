import { z } from './.deps.ts';
import { EaCSimulatorDetails, EaCSimulatorDetailsSchema } from './EaCSimulatorDetails.ts';

export type EaCSharedSimulatorDetails = EaCSimulatorDetails<'Shared'> & {
  /** Source IoT Hub device that Node-RED is writing into */
  Source: {
    /** Canonical lookup of the data connection supplying the source IoT Hub */
    DataConnectionLookup: string;
    /** The deviceId in that IoT Hub that Node-RED uses */
    DeviceID: string;
  };

  /** Optional human note */
  Note?: string;
};

export const EaCSharedSimulatorDetailsSchema: z.ZodType<EaCSharedSimulatorDetails> =
  EaCSimulatorDetailsSchema.extend({
    Type: z.literal('Shared'),
    Source: z.object({
      DataConnectionLookup: z.string(),
      DeviceID: z.string(),
    }),
    Note: z.string().optional(),
  }).describe(
    'Schema for a Shared (relay) simulator that fans out source device telemetry.',
  );

export function isEaCSharedSimulatorDetails(
  details: unknown,
): details is EaCSharedSimulatorDetails {
  return EaCSharedSimulatorDetailsSchema.safeParse(details).success;
}

export function parseEaCSharedSimulatorDetails(
  details: unknown,
): EaCSharedSimulatorDetails {
  return EaCSharedSimulatorDetailsSchema.parse(details);
}


import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import {
  EaCDataConnectionDetails,
  EaCDataConnectionDetailsSchema,
} from './EaCDataConnectionDetails.ts';
import { EaCFlowNodeMetadata, EaCFlowNodeMetadataSchema } from './EaCFlowNodeMetadata.ts';

/**
 * Represents an Everything as Code (EaC) Data Connection.
 *
 * Data connections do not define relationships; they are globally declared,
 * and other nodes (e.g. surfaces) may point to them via lookup keys.
 */
export type EaCDataConnectionAsCode = EaCDetails<EaCDataConnectionDetails> & {
  /** Optional lookup key for associating this connection with a simulator instance. */
  SimulatorLookup?: string;

  /** Flow metadata used for canvas placement and enablement tracking. */
  Metadata?: EaCFlowNodeMetadata;
};

/**
 * Schema for EaCDataConnectionAsCode — includes structural, runtime, and canvas metadata.
 */
export const EaCDataConnectionAsCodeSchema: z.ZodType<EaCDataConnectionAsCode> = EaCDetailsSchema
  .extend({
    Details: EaCDataConnectionDetailsSchema.optional(),
    SimulatorLookup: z
      .string()
      .optional()
      .describe('Optional lookup key for associated simulator.'),
    Metadata: EaCFlowNodeMetadataSchema.optional(),
  }).describe(
    'Schema for a reusable data connection definition with simulator and layout metadata.',
  );

/**
 * Type guard for EaCDataConnectionAsCode.
 */
export function isEaCDataConnectionAsCode(
  conn: unknown,
): conn is EaCDataConnectionAsCode {
  return EaCDataConnectionAsCodeSchema.safeParse(conn).success;
}

/**
 * Validates and parses an object as EaCDataConnectionAsCode.
 */
export function parseEaCDataConnectionAsCode(
  conn: unknown,
): EaCDataConnectionAsCode {
  return EaCDataConnectionAsCodeSchema.parse(conn);
}

import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import { EaCSimulatorDetails, EaCSimulatorDetailsSchema } from './EaCSimulatorDetails.ts';
import { EaCFlowNodeMetadata, EaCFlowNodeMetadataSchema } from './EaCFlowNodeMetadata.ts';

/**
 * Represents a deployed simulator instance within an Everything as Code (EaC) workspace.
 *
 * This is a standalone container with no outbound relationships — it exists to
 * configure and persist simulator runtime context, which may be referenced by
 * DataConnections via `SimulatorLookup`.
 */
export type EaCSimulatorAsCode<
  TDetails extends EaCSimulatorDetails = EaCSimulatorDetails,
> = EaCDetails<TDetails> & {
  /** Canvas metadata for simulator layout and activation state. */
  Metadata?: EaCFlowNodeMetadata;
};

/**
 * Zod schema for EaCSimulatorAsCode.
 */
export const EaCSimulatorAsCodeSchema: z.ZodType<EaCSimulatorAsCode> = EaCDetailsSchema.extend({
  Details: EaCSimulatorDetailsSchema.optional(),
  Metadata: EaCFlowNodeMetadataSchema.optional(),
}).describe(
  'Schema for a simulator node with canvas metadata and runtime config.',
);

/**
 * Type guard for EaCSimulatorAsCode.
 */
export function isEaCSimulatorAsCode(sim: unknown): sim is EaCSimulatorAsCode {
  return EaCSimulatorAsCodeSchema.safeParse(sim).success;
}

/**
 * Parses and validates an object as EaCSimulatorAsCode.
 */
export function parseEaCSimulatorAsCode(sim: unknown): EaCSimulatorAsCode {
  return EaCSimulatorAsCodeSchema.parse(sim);
}

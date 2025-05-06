import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import { EaCAgentDetails, EaCAgentDetailsSchema } from './EaCAgentDetails.ts';
import { EaCFlowNodeMetadata, EaCFlowNodeMetadataSchema } from './EaCFlowNodeMetadata.ts';

/**
 * Represents an Agent in Everything as Code (EaC).
 *
 * Agents contain decision logic, and operate over schemas via reflex-style evaluations.
 */
export type EaCAgentAsCode = EaCDetails<EaCAgentDetails> & {
  /** Flow canvas metadata (enabled state and layout position). */
  Metadata?: EaCFlowNodeMetadata;
};

/**
 * Schema for EaCAgentAsCode — includes canvas-level metadata and configuration.
 */
export const EaCAgentAsCodeSchema: z.ZodType<EaCAgentAsCode> = EaCDetailsSchema.extend({
  Details: EaCAgentDetailsSchema.optional(),
  Metadata: EaCFlowNodeMetadataSchema.optional(),
}).describe(
  'Schema for an agent node with reflex logic and layout metadata.',
);

/**
 * Type guard for EaCAgentAsCode.
 */
export function isEaCAgentAsCode(agent: unknown): agent is EaCAgentAsCode {
  return EaCAgentAsCodeSchema.safeParse(agent).success;
}

/**
 * Parses and validates an object as EaCAgentAsCode.
 */
export function parseEaCAgentAsCode(agent: unknown): EaCAgentAsCode {
  return EaCAgentAsCodeSchema.parse(agent);
}

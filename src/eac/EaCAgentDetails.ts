import { EaCVertexDetails, EaCVertexDetailsSchema, z } from './.deps.ts';

/**
 * Represents details for an Agent in Everything as Code (EaC).
 *
 * Agents operate over schemas and emit signals based on reflex logic.
 */
export type EaCAgentDetails = EaCVertexDetails;

/**
 * Schema for EaCAgentDetails.
 */
export const EaCAgentDetailsSchema: z.ZodObject<
  {
    Description: z.ZodOptional<z.ZodString>;
    Name: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  EaCVertexDetails,
  EaCVertexDetails
> = EaCVertexDetailsSchema.describe('Schema for base agent definition in EaC.');

/**
 * Type guard for EaCAgentDetails.
 */
export function isEaCAgentDetails(
  details: unknown,
): details is EaCAgentDetails {
  return EaCAgentDetailsSchema.safeParse(details).success;
}

/**
 * Parses and validates an object as EaCAgentDetails.
 */
export function parseEaCAgentDetails(details: unknown): EaCAgentDetails {
  return EaCAgentDetailsSchema.parse(details);
}

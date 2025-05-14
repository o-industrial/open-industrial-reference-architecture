import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import {
  EaCProposalConfigDetails,
  EaCProposalConfigDetailsSchema,
} from './EaCProposalConfigDetails.ts';

/**
 * Represents a Proposal Configuration in Everything as Code (EaC).
 *
 * This configures:
 * - where proposals are persisted (IcebergLookup)
 * - which types are allowed
 * - and how they are managed
 */
export type EaCProposalConfigAsCode = EaCDetails<EaCProposalConfigDetails>;

/**
 * Schema for EaCProposalConfigAsCode — includes node metadata and proposal policy settings.
 */
export const EaCProposalConfigAsCodeSchema: z.ZodType<EaCProposalConfigAsCode> = EaCDetailsSchema
  .extend({
    Details: EaCProposalConfigDetailsSchema.optional(),
  }).describe(
    'Schema for a proposal config node — defines allowed proposal types, storage, and review policy.',
  );

/**
 * Type guard for EaCProposalConfigAsCode.
 */
export function isEaCProposalConfigAsCode(
  config: unknown,
): config is EaCProposalConfigAsCode {
  return EaCProposalConfigAsCodeSchema.safeParse(config).success;
}

/**
 * Parses and validates an object as EaCProposalConfigAsCode.
 */
export function parseEaCProposalConfigAsCode(
  config: unknown,
): EaCProposalConfigAsCode {
  return EaCProposalConfigAsCodeSchema.parse(config);
}

import { EaCVertexDetails, EaCVertexDetailsSchema, z } from './.deps.ts';

/**
 * Configuration structure for proposal behavior in Everything as Code (EaC).
 *
 * This config does **not** represent a specific proposal instance — it defines:
 * - where proposals are stored
 * - which types are allowed
 * - whether forking and review are required
 */
export type EaCProposalConfigDetails = {
  /** Iceberg, DFS, or storage location where proposals are persisted. */
  IcebergLookup: string;

  /** Allowed proposal types (e.g., 'Schema', 'Agent', 'Composite'). */
  SupportedProposalTypes: string[];

  /** Optional number of days to retain proposals before expiration. */
  DefaultRetentionDays?: number;

  /** Whether proposals can be forked into alternative paths. */
  AllowForking?: boolean;

  /** Whether proposals must be reviewed before promotion. */
  RequireReview?: boolean;
} & EaCVertexDetails;

/**
 * Zod schema for validating EaCProposalConfigDetails.
 */
export const EaCProposalConfigDetailsSchema: z.ZodType<EaCProposalConfigDetails> =
  EaCVertexDetailsSchema.extend({
    IcebergLookup: z
      .string()
      .min(1)
      .describe('The DFS or Iceberg path where proposals will be written.'),

    SupportedProposalTypes: z
      .array(z.string().min(1))
      .min(1)
      .describe('A list of allowed proposal type names.'),

    DefaultRetentionDays: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Number of days to keep proposals before auto-archiving.'),

    AllowForking: z
      .boolean()
      .optional()
      .describe('Whether proposals can be branched into new paths.'),

    RequireReview: z
      .boolean()
      .optional()
      .describe('If true, proposals must be human-reviewed before promotion.'),
  }).describe('Config object that defines proposal management behavior in EaC.');

/**
 * Type guard for EaCProposalConfigDetails.
 */
export function isEaCProposalConfigDetails(
  config: unknown,
): config is EaCProposalConfigDetails {
  return EaCProposalConfigDetailsSchema.safeParse(config).success;
}

/**
 * Parses and validates an object as EaCProposalConfigDetails.
 */
export function parseEaCProposalConfigDetails(
  config: unknown,
): EaCProposalConfigDetails {
  return EaCProposalConfigDetailsSchema.parse(config);
}

import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import { EaCIntegrationDetails, EaCIntegrationDetailsSchema } from './EaCIntegrationDetails.ts';

/**
 * Represents an OEM integration definition bound to a specific foundation (landing zone).
 */
export type EaCIntegrationAsCode<
  TDetails extends EaCIntegrationDetails = EaCIntegrationDetails,
> = EaCDetails<TDetails> & {
  /** Lookup key of the foundation (landing zone) this integration targets. */
  FoundationLookup: string;
};

/**
 * Zod schema for `EaCIntegrationAsCode`.
 */
export const EaCIntegrationAsCodeSchema: z.ZodType<EaCIntegrationAsCode> = EaCDetailsSchema
  .extend({
    Details: EaCIntegrationDetailsSchema.optional(),
    FoundationLookup: z
      .string()
      .min(1)
      .describe('Lookup key of the foundation (landing zone) this integration targets.'),
  })
  .describe('Everything-as-Code node describing an OEM integration plan.');

/**
 * Type guard for `EaCIntegrationAsCode`.
 */
export function isEaCIntegrationAsCode(
  value: unknown,
): value is EaCIntegrationAsCode {
  return EaCIntegrationAsCodeSchema.safeParse(value).success;
}

/**
 * Validates and parses an object as `EaCIntegrationAsCode`.
 */
export function parseEaCIntegrationAsCode(
  value: unknown,
): EaCIntegrationAsCode {
  return EaCIntegrationAsCodeSchema.parse(value);
}

import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import { EaCPackDetails, EaCPackDetailsSchema } from './EaCPackDetails.ts';

/**
 * Represents a declared runtime capability Pack in Everything-as-Code (EaC).
 *
 * Packs extend the runtime via installed modules and expose node capabilities.
 */
export type EaCPackAsCode = EaCDetails<EaCPackDetails>;

/**
 * Zod schema for `EaCPackAsCode`.
 */
export const EaCPackAsCodeSchema: z.ZodType<EaCPackAsCode> = EaCDetailsSchema.extend({
  Details: EaCPackDetailsSchema.optional(),
}).describe('Declared runtime pack for loading system capabilities.');

/**
 * Type guard for EaCPackAsCode.
 */
export function isEaCPackAsCode(pack: unknown): pack is EaCPackAsCode {
  return EaCPackAsCodeSchema.safeParse(pack).success;
}

/**
 * Parser for EaCPackAsCode.
 */
export function parseEaCPackAsCode(pack: unknown): EaCPackAsCode {
  return EaCPackAsCodeSchema.parse(pack);
}

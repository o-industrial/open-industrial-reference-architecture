import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import {
  EaCFoundationDetails,
  EaCFoundationDetailsSchema,
} from './EaCFoundationDetails.ts';

/**
 * Represents a workspace foundation definition bound to a specific cloud.
 */
export type EaCFoundationAsCode<
  TDetails extends EaCFoundationDetails = EaCFoundationDetails,
> = EaCDetails<TDetails> & {
  /** Lookup key of the cloud this foundation should target. */
  CloudLookup: string;
};

/**
 * Zod schema for `EaCFoundationAsCode`.
 */
export const EaCFoundationAsCodeSchema: z.ZodType<EaCFoundationAsCode> = EaCDetailsSchema.extend({
  Details: EaCFoundationDetailsSchema.optional(),
  CloudLookup: z
    .string()
    .min(1)
    .describe('Lookup key of the cloud this foundation should target.'),
}).describe('Everything-as-Code node describing a foundation plan for a workspace.');

/**
 * Type guard for `EaCFoundationAsCode`.
 */
export function isEaCFoundationAsCode(
  value: unknown,
): value is EaCFoundationAsCode {
  return EaCFoundationAsCodeSchema.safeParse(value).success;
}

/**
 * Validates and parses an object as `EaCFoundationAsCode`.
 */
export function parseEaCFoundationAsCode(
  value: unknown,
): EaCFoundationAsCode {
  return EaCFoundationAsCodeSchema.parse(value);
}


import { z } from './.deps.ts';
import { EaCSchemaDetails, EaCSchemaDetailsSchema } from './EaCSchemaDetails.ts';
import { JSONSchemaMapSchema } from './types/JSONSchemaMap.ts';

/**
 * Represents a Reference schema definition — lookup-style static or semi-static data.
 *
 * Reference schemas provide contextual enrichment to core data during joins.
 */
export type EaCReferenceSchemaDetails = EaCSchemaDetails<'Reference'>;

/**
 * Schema for EaCReferenceSchemaDetails.
 */
export const EaCReferenceSchemaDetailsSchema: z.ZodType<EaCReferenceSchemaDetails> =
  EaCSchemaDetailsSchema.extend({
    Type: z.literal('Reference'),
    DataConnectionLookup: z
      .string()
      .optional()
      .describe(
        "Key for resolving the DataConnection that supplies this reference schema's data.",
      ),
    DataConnectionSchemaMap: JSONSchemaMapSchema.optional().describe(
      'Mapping rules from DataConnection into schema fields.',
    ),
  }).describe(
    'Schema for Reference-type schema used for contextual enrichment.',
  ) as unknown as z.ZodType<EaCReferenceSchemaDetails>;

export function isEaCReferenceSchemaDetails(
  details: unknown,
): details is EaCReferenceSchemaDetails {
  return EaCReferenceSchemaDetailsSchema.safeParse(details).success;
}

export function parseEaCReferenceSchemaDetails(
  details: unknown,
): EaCReferenceSchemaDetails {
  return EaCReferenceSchemaDetailsSchema.parse(details);
}

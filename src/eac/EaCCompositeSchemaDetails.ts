import { EaCSchemaDetails, EaCSchemaDetailsSchema } from './EaCSchemaDetails.ts';
import { JSONSchemaMap, JSONSchemaMapSchema } from './types/JSONSchemaMap.ts';
import { z } from './.deps.ts';

/**
 * Represents a Composite schema definition — joins multiple schemas into a unified structure.
 *
 * Composite schemas are not directly bound to DataConnections, but merge fields from others.
 */
export type EaCCompositeSchemaDetails = EaCSchemaDetails<'Composite'> & {
  /**
   * Defines how joined schemas are represented in the field mapping context.
   * Key = alias to use in field maps; Value = schema lookup key.
   */
  SchemaJoins: Record<string, string>;

  /** Mapping configuration from joined schemas into this composite schema. */
  CompositeSchemaMap?: JSONSchemaMap;
};

/**
 * Schema for EaCCompositeSchemaDetails.
 */
export const EaCCompositeSchemaDetailsSchema: z.ZodType<EaCCompositeSchemaDetails> =
  EaCSchemaDetailsSchema.extend({
    Type: z.literal('Composite'),
    SchemaJoins: z
      .record(z.string())
      .describe('Map of field prefix aliases to schema lookup keys.'),
    CompositeSchemaMap: JSONSchemaMapSchema.optional().describe(
      'Mapping rules from joined schemas into composite fields.',
    ),
  }).describe(
    'Schema for Composite-type schema used to join multiple schema sources.',
  ) as unknown as z.ZodType<EaCCompositeSchemaDetails>;

export function isEaCCompositeSchemaDetails(
  details: unknown,
): details is EaCCompositeSchemaDetails {
  return EaCCompositeSchemaDetailsSchema.safeParse(details).success;
}

export function parseEaCCompositeSchemaDetails(
  details: unknown,
): EaCCompositeSchemaDetails {
  return EaCCompositeSchemaDetailsSchema.parse(details);
}

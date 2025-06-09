import { EaCWarmQueryDetails, EaCWarmQueryDetailsSchema } from './EaCWarmQueryDetails.ts';
import { JSONSchemaMap, JSONSchemaMapSchema } from './types/JSONSchemaMap.ts';
import { z } from './.deps.ts';

export type EaCCompositeWarmQueryDetails = EaCWarmQueryDetails<'Composite'> & {
  SchemaJoins: Record<string, string>;

  CompositeSchemaMap?: JSONSchemaMap;
};

export const EaCCompositeWarmQueryDetailsSchema: z.ZodType<EaCCompositeWarmQueryDetails> =
  EaCWarmQueryDetailsSchema.extend({
    Type: z.literal('Composite'),
    SchemaJoins: z
      .record(z.string())
      .describe('Map of field prefix aliases to schema lookup keys.'),
    CompositeSchemaMap: JSONSchemaMapSchema.optional().describe(
      'Mapping rules from joined schemas into composite fields.',
    ),
  }).describe(
    'Schema for Composite-type schema used to join multiple schema sources.',
  ) as unknown as z.ZodType<EaCCompositeWarmQueryDetails>;

export function isEaCCompositeWarmQueryDetails(
  details: unknown,
): details is EaCCompositeWarmQueryDetails {
  return EaCCompositeWarmQueryDetailsSchema.safeParse(details).success;
}

export function parseEaCCompositeWarmQueryDetails(
  details: unknown,
): EaCCompositeWarmQueryDetails {
  return EaCCompositeWarmQueryDetailsSchema.parse(details);
}

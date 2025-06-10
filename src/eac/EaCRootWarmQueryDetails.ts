import { z } from './.deps.ts';
import { EaCWarmQueryDetails, EaCWarmQueryDetailsSchema } from './EaCWarmQueryDetails.ts';
import { JSONSchemaMapSchema } from './types/JSONSchemaMap.ts';

export type EaCRootWarmQueryDetails = EaCWarmQueryDetails<'Root'>;

export const EaCRootWarmQueryDetailsSchema: z.ZodType<EaCRootWarmQueryDetails> =
  EaCWarmQueryDetailsSchema
    .extend({
      Type: z.literal('Root'),
      DataConnectionLookup: z
        .string()
        .optional()
        .describe(
          "Key for resolving the DataConnection that supplies this schema's data.",
        ),
      DataConnectionSettings: z
        .object({
          JSONSchemaMap: JSONSchemaMapSchema.optional(),
        })
        .catchall(z.unknown())
        .optional()
        .describe('Configuration for mapping incoming data into this schema.'),
    }).describe(
      'Schema for Root-type schema used for raw data ingestion.',
    ) as unknown as z.ZodType<EaCRootWarmQueryDetails>;

export function isEaCRootWarmQueryDetails(
  details: unknown,
): details is EaCRootWarmQueryDetails {
  return EaCRootWarmQueryDetailsSchema.safeParse(details).success;
}

export function parseEaCRootWarmQueryDetails(
  details: unknown,
): EaCRootWarmQueryDetails {
  return EaCRootWarmQueryDetailsSchema.parse(details);
}

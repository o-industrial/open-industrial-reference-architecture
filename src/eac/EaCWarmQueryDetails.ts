import { EaCVertexDetails, EaCVertexDetailsSchema, z } from './.deps.ts';

export type EaCWarmQueryDetails<TType extends string | undefined = string> = {
  Version?: number;
  Query?: string;
} & EaCVertexDetails;

export const EaCWarmQueryDetailsSchema: z.ZodType<EaCWarmQueryDetails> = EaCVertexDetailsSchema
  .extend({
    Version: z.number(),
    Query: z.string(),
  }).describe('Schema for warm query-level metadata and attributes.');

export function isEaCWarmQueryDetails(
  details: unknown,
): details is EaCWarmQueryDetails {
  return EaCWarmQueryDetailsSchema.safeParse(details).success;
}

export function parseEaCWarmQueryDetails(
  details: unknown,
): EaCWarmQueryDetails {
  return EaCWarmQueryDetailsSchema.parse(details);
}

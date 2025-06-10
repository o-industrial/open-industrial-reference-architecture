import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import { EaCWarmQueryDetails, EaCWarmQueryDetailsSchema } from './EaCWarmQueryDetails.ts';

export type EaCWarmQueryAsCode = EaCDetails<EaCWarmQueryDetails>;

export const EaCWarmQueryAsCodeSchema: z.ZodType<EaCWarmQueryAsCode> = EaCDetailsSchema.extend({
  Details: EaCWarmQueryDetailsSchema.optional(),
}).describe(
  'Schema for a warm query node in the flow.',
);

export function isEaCWarmQueryAsCode(
  warmQuery: unknown,
): warmQuery is EaCWarmQueryAsCode {
  return EaCWarmQueryAsCodeSchema.safeParse(warmQuery).success;
}

export function parseEaCWarmQueryAsCode(warmQuery: unknown): EaCWarmQueryAsCode {
  return EaCWarmQueryAsCodeSchema.parse(warmQuery);
}

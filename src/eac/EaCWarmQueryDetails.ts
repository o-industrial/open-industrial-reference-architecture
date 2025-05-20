import { EaCVertexDetails, EaCVertexDetailsSchema, z } from "./.deps.ts";

export type EaCWarmQueryDetails = {
  Version: number;

  Query: string;
} & EaCVertexDetails;

export const EaCWarmQueryDetailsSchema: z.ZodObject<
  {
    Description: z.ZodOptional<z.ZodString>;
    Name: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  EaCVertexDetails,
  EaCVertexDetails
> = EaCVertexDetailsSchema.describe(
  'Schema for warm query-level metadata and attributes.',
);

export function isEaCWarmQueryDetails(
  details: unknown,
): details is EaCWarmQueryDetails {
  return EaCWarmQueryDetailsSchema.safeParse(details).success;
}

export function parseEaCWarmQueryDetails(details: unknown): EaCWarmQueryDetails {
  return EaCWarmQueryDetailsSchema.parse(details);
}


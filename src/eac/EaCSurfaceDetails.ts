import { EaCVertexDetails, EaCVertexDetailsSchema, z } from './.deps.ts';

/**
 * Basic details structure for a Surface in Everything as Code (EaC).
 *
 * Surfaces represent user-facing dashboards or control panels.
 */
export type EaCSurfaceDetails = EaCVertexDetails;

/**
 * Schema for EaCSurfaceDetails.
 */
export const EaCSurfaceDetailsSchema: z.ZodObject<
  {
    Description: z.ZodOptional<z.ZodString>;
    Name: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  EaCVertexDetails,
  EaCVertexDetails
> = EaCVertexDetailsSchema.describe(
  'Schema for surface-level metadata and attributes.',
);

/**
 * Type guard for EaCSurfaceDetails.
 */
export function isEaCSurfaceDetails(
  details: unknown,
): details is EaCSurfaceDetails {
  return EaCSurfaceDetailsSchema.safeParse(details).success;
}

/**
 * Parses and validates an object as EaCSurfaceDetails.
 */
export function parseEaCSurfaceDetails(details: unknown): EaCSurfaceDetails {
  return EaCSurfaceDetailsSchema.parse(details);
}

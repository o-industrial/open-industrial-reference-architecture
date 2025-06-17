import { EaCVertexDetails, EaCVertexDetailsSchema, z } from './.deps.ts';

/**
 * Represents metadata for a Pack in Everything-as-Code (EaC).
 *
 * A Pack points to a runtime capability module and can be enabled or disabled.
 */
export type EaCPackDetails = EaCVertexDetails & {
  /** Required module path or URL (e.g., jsr:@modbus, ./packs/devtools/index.ts). */
  Path: string;

  /** Optional toggle to disable a declared pack at runtime. */
  Enabled?: boolean;
};

/**
 * Schema for `EaCPackDetails`.
 */
export const EaCPackDetailsSchema: z.ZodObject<
  {
    Description: z.ZodOptional<z.ZodString>;
    Name: z.ZodOptional<z.ZodString>;
    Path: z.ZodString;
    Enabled: z.ZodOptional<z.ZodBoolean>;
  },
  'strip',
  z.ZodTypeAny,
  EaCPackDetails,
  EaCPackDetails
> = EaCVertexDetailsSchema.extend({
  Path: z
    .string()
    .describe('Module path (URL, jsr, or local) for the runtime pack entry.'),

  Enabled: z
    .boolean()
    .optional()
    .describe('Whether the pack should be activated at runtime.'),
}).describe('Declarative metadata for a runtime pack installation.');

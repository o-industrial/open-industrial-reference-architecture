// StepModuleMetadata.ts

import { z, ZodType } from './.deps.ts';

/**
 * Describes the identity, behavior, and classification of a Step.
 * Used in registries, UIs, graphs, and devtools — not CLI help.
 */
export type StepModuleMetadata = {
  /**
   * Canonical name of the step (e.g. "Azure IoT Device Provisioning").
   */
  Name: string;

  /**
   * Optional short description of the step’s function or outcome.
   */
  Description?: string;

  /**
   * Optional category for visual grouping or navigation (e.g. "Azure", "Control Plane").
   */
  Category?: string;

  /**
   * Optional semantic tags for filtering, search, and discovery.
   */
  Labels?: string[];

  /**
   * Optional Zod schema describing the expected input payload structure.
   * Not serializable — used for introspection and devtools.
   */
  InputSchema?: ZodType;

  /**
   * Optional Zod schema describing the structure of the step output.
   * Not serializable — used for introspection and tooling.
   */
  OutputSchema?: ZodType;

  /**
   * Optional Zod schema describing available runtime options.
   * Not serializable — used by execution UIs or dynamic builders.
   */
  OptionsSchema?: ZodType;
};

/**
 * Runtime-validatable schema for serializable metadata fields only.
 * Excludes schema definitions (Input/Output/Options), which are not JSON-safe.
 */
export const StepModuleMetadataSchema: z.ZodObject<
  {
    Name: z.ZodString;
    Description: z.ZodOptional<z.ZodString>;
    Category: z.ZodOptional<z.ZodString>;
    Labels: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
  },
  'strip',
  z.ZodTypeAny,
  Omit<StepModuleMetadata, 'InputSchema' | 'OutputSchema' | 'OptionsSchema'>,
  Omit<StepModuleMetadata, 'InputSchema' | 'OutputSchema' | 'OptionsSchema'>
> = z.object({
  Name: z
    .string()
    .min(1, 'Step name is required.')
    .describe('Canonical step name (used in UIs, dashboards, and introspection)'),

  Description: z
    .string()
    .optional()
    .describe('Optional one-line summary of what the step does'),

  Category: z
    .string()
    .optional()
    .describe('Optional grouping label for filtering or display (e.g. "Azure", "Git")'),

  Labels: z
    .array(z.string())
    .optional()
    .describe('Freeform tags like "iot", "cloud", "infra" to aid in discovery'),
});

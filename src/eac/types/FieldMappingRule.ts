// deno-lint-ignore-file no-explicit-any

import { z } from '../.deps.ts';

/**
 * Defines how a field in a schema should be populated by mapping data from one or more sources.
 */
export type FieldMappingRule<TSource = string | Record<string, string>> = {
  /**
   * Default value to use if resolution fails.
   */
  Default?: any;

  /**
   * Optional string-based expression to evaluate against source values.
   * Useful for arithmetic and logic without custom code.
   */
  Expression?: string;

  /**
   * Optional named operation (to be handled by the runtime) for common transformations.
   */
  Operation?: string;

  /**
   * Whether this field must be present in the final output.
   */
  Required?: boolean;

  /**
   * Defines the input(s) to pull data from.
   * - string: single dot-path (e.g. 'impulse.payload.tempF')
   * - Record<string, string>: named inputs from multiple sources
   */
  Source: TSource;
};

/**
 * Zod schema for a FieldMappingRule.
 * Supports either a single source string or a named source object.
 */
export type FieldMappingRuleSchema = z.ZodObject<
  {
    Expression: z.ZodOptional<z.ZodString>;
    Operation: z.ZodOptional<z.ZodString>;
    Required: z.ZodOptional<z.ZodBoolean>;
    Source: z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>]>;
    Default: z.ZodOptional<z.ZodUnknown>;
  },
  'strip',
  z.ZodTypeAny,
  FieldMappingRule,
  FieldMappingRule
>;

export const FieldMappingRuleSchema: FieldMappingRuleSchema = z
  .object({
    /**
     * Optional string-based expression to evaluate against source values.
     */
    Expression: z.string().optional(),

    /**
     * Optional named operation (to be handled by the runtime).
     */
    Operation: z.string().optional(),

    /**
     * Whether this field must be present in the final output.
     */
    Required: z.boolean().optional(),

    /**
     * Source input(s) for the mapping.
     * Can be a single dot-path string or a named record of paths.
     */
    Source: z
      .union([z.string(), z.record(z.string())])
      .describe(
        'Either a single string path or a named record of string paths.',
      ),

    /**
     * Default fallback if value resolution fails.
     */
    Default: z.unknown().optional(),
  })
  .describe('Schema for field-level mapping logic between schemas.');

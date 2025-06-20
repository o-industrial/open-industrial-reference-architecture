import { z } from '../fluent/types/.deps.ts';

/**
 * Shared minimal stats schema for runtime components.
 */
export const RuntimeStatsSchema: z.ZodObject<{
  ImpulseRates: z.ZodArray<z.ZodNumber, 'many'>;
  Metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}> = z.object({
  /**
   * Impulse rates over time buckets: [60s, 5m, 1h]
   */
  ImpulseRates: z
    .array(z.number().nonnegative())
    .length(3)
    .describe('Impulse rates over [60s, 5m, 1h] window'),

  /**
   * Optional debug or diagnostic metadata.
   */
  Metadata: z
    .record(z.string())
    .optional()
    .describe('Optional debug or display metadata'),
});

export type RuntimeStats = z.infer<typeof RuntimeStatsSchema>;

import { EaCVertexDetails, EaCVertexDetailsSchema, z } from './.deps.ts';

/**
 * Base details describing an OEM integration bound to an Open Industrial workspace.
 *
 * Concrete integration types (Node-RED, Grafana, etc.) extend this structure with
 * additional configuration fields while retaining the shared EaC vertex metadata.
 */
export type EaCIntegrationDetails<TType extends string = string> = EaCVertexDetails & {
  /** Discriminator identifying the integration subtype. */
  Type: TType;

  /** Optional tags applied to the integration for filtering and organization. */
  Tags?: Record<string, string>;

  /** Latest recorded outputs from integration SOP executions. */
  Outputs?: Record<string, unknown>;
};

/**
 * Zod schema for `EaCIntegrationDetails`.
 */
export const EaCIntegrationDetailsSchema: z.ZodType<EaCIntegrationDetails> = EaCVertexDetailsSchema
  .extend({
    Type: z
      .string()
      .min(1)
      .describe('Discriminator identifying the integration subtype.'),
    Tags: z
      .record(z.string())
      .optional()
      .describe('Optional tags applied to the integration.'),
    Outputs: z
      .record(z.unknown())
      .optional()
      .describe('Latest recorded outputs from integration SOP executions.'),
  })
  .describe('Details describing a workspace integration.');

/**
 * Type guard for `EaCIntegrationDetails`.
 */
export function isEaCIntegrationDetails(
  value: unknown,
): value is EaCIntegrationDetails {
  return EaCIntegrationDetailsSchema.safeParse(value).success;
}

/**
 * Validates and parses an object as `EaCIntegrationDetails`.
 */
export function parseEaCIntegrationDetails(
  value: unknown,
): EaCIntegrationDetails {
  return EaCIntegrationDetailsSchema.parse(value);
}

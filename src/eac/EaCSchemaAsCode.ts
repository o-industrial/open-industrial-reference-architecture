import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import { EaCSchemaDetails, EaCSchemaDetailsSchema } from './EaCSchemaDetails.ts';
import { EaCFlowNodeMetadata, EaCFlowNodeMetadataSchema } from './EaCFlowNodeMetadata.ts';

/**
 * Everything as Code (EaC) schema container.
 * Includes structural metadata and details that vary by schema type.
 */
export type EaCSchemaAsCode = EaCDetails<EaCSchemaDetails> & {
  /** Canvas metadata for schema node layout and activation. */
  Metadata?: EaCFlowNodeMetadata;
};

/**
 * Schema for EaCSchemaAsCode — includes canvas layout and structural metadata.
 */
export const EaCSchemaAsCodeSchema: z.ZodType<EaCSchemaAsCode> = EaCDetailsSchema.extend({
  Details: EaCSchemaDetailsSchema.optional(),
  Metadata: EaCFlowNodeMetadataSchema.optional(),
}).describe(
  'Schema for a workspace-level schema node with metadata and canvas settings.',
);

/**
 * Type guard for EaCSchemaAsCode.
 */
export function isEaCSchemaAsCode(schema: unknown): schema is EaCSchemaAsCode {
  return EaCSchemaAsCodeSchema.safeParse(schema).success;
}

/**
 * Parses and validates an object as EaCSchemaAsCode.
 */
export function parseEaCSchemaAsCode(schema: unknown): EaCSchemaAsCode {
  return EaCSchemaAsCodeSchema.parse(schema);
}

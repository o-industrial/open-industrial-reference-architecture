import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import { EaCSchemaDetails, EaCSchemaDetailsSchema } from './EaCSchemaDetails.ts';

/**
 * Configuration for associating this schema with a data connection.
 */
export type SchemaDataConnectionSettings = {
  /** Lookup key to the bound data connection. */
  Lookup: string;
};

/**
 * Runtime configuration for referencing another schema within this schema.
 */
// deno-lint-ignore ban-types
export type SchemaSchemaSettings = {
  // Reserved for future fields (field-level overrides, joins, etc.)
};

/**
 * Everything as Code (EaC) schema container.
 * Includes structural metadata and details that vary by schema type.
 */
export type EaCSchemaAsCode<
  TDetails extends EaCSchemaDetails = EaCSchemaDetails,
> = EaCDetails<TDetails> & {
  /** Lookup key to a bound data connection. */
  DataConnection?: SchemaDataConnectionSettings;

  /** Mapping of referenced schemas used in this schema (composite, reference). */
  SchemaLookups?: Record<string, SchemaSchemaSettings>;
};

/**
 * Schema for EaCSchemaAsCode — includes metadata, connection, and structural references.
 */
export const EaCSchemaAsCodeSchema: z.ZodType<EaCSchemaAsCode> = EaCDetailsSchema.extend({
  Details: EaCSchemaDetailsSchema.optional(),

  DataConnection: z
    .object({
      Lookup: z.string(),
    })
    .optional()
    .describe('Optional binding to a specific data connection.'),

  SchemaLookups: z
    .record(z.object({}).catchall(z.unknown()))
    .optional()
    .describe('Optional map of related schemas joined or composed.'),
}).describe(
  'Schema for a workspace-level schema node with metadata and external bindings.',
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

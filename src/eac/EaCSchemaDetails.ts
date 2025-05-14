import { EaCVertexDetails, EaCVertexDetailsSchema, JSONSchema7, z } from './.deps.ts';
import { JSONSchemaMap } from './types/JSONSchemaMap.ts';

/**
 * Represents the base details structure for a Schema in Everything as Code (EaC).
 *
 * Concrete schema types (Core, Reference, Composite) will extend this.
 */
export type EaCSchemaDetails<TType extends string | undefined = string> = {
  /** The type identifier for this schema. */
  Type: TType;

  /** The version string for schema evolution. */
  Version?: string;

  /** The full JSON Schema structure. */
  Schema?: JSONSchema7;

  /** Settings for mapping data connection input into schema fields. */
  DataConnectionSchemaMap?: JSONSchemaMap;
} & EaCVertexDetails;

/**
 * Schema for validating a base EaCSchemaDetails object.
 */
export type EaCSchemaDetailsSchema = z.ZodObject<
  z.objectUtil.extendShape<
    {
      Description: z.ZodOptional<z.ZodString>;
      Name: z.ZodOptional<z.ZodString>;
    },
    {
      Type: z.ZodString;
      Version: z.ZodOptional<z.ZodString>;
      Schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }
  >,
  'strip',
  z.ZodTypeAny,
  EaCSchemaDetails,
  EaCSchemaDetails
>;

export const EaCSchemaDetailsSchema: EaCSchemaDetailsSchema = EaCVertexDetailsSchema.extend({
  Type: z.string().describe('Type identifier for the schema.'),
  Version: z
    .string()
    .optional()
    .describe('Version tag for schema evolution.'),
  Schema: z
    .record(z.unknown())
    .optional()
    .describe('The JSON schema definition.'),
}).describe(
  'Schema for a typed schema definition in EaC.',
) as unknown as EaCSchemaDetailsSchema;

/**
 * Type guard for EaCSchemaDetails.
 */
export function isEaCSchemaDetails<TType extends string | undefined = string>(
  type: TType,
  schema: unknown,
): schema is EaCSchemaDetails<TType> {
  if (!EaCSchemaDetailsSchema.safeParse(schema).success) return false;
  return !type || (schema as EaCSchemaDetails<TType>).Type === type;
}

/**
 * Parses and validates an object as EaCSchemaDetails.
 */
export function parseEaCSchemaDetails<
  TType extends string | undefined = string,
>(schema: unknown): EaCSchemaDetails<TType> {
  return EaCSchemaDetailsSchema.parse(schema) as EaCSchemaDetails<TType>;
}

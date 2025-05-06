import { EaCVertexDetails, EaCVertexDetailsSchema, z } from './.deps.ts';

/**
 * Enum of supported multiprotocol ingest options.
 */
export const MultiProtocolIngestOptions = [
  'Default',
  'HTTP',
  'MQTT',
  'WebSocket',
] as const;
export type MultiProtocolIngestOption = (typeof MultiProtocolIngestOptions)[number];

/**
 * Represents the base details structure for a Data Connection in Everything as Code (EaC).
 *
 * Concrete types (e.g., MQTT, HTTP, File) will extend this with specific fields.
 */
export type EaCDataConnectionDetails<
  TType extends string | undefined = string,
> = {
  /** The type identifier for this data connection. */
  Type: TType;

  /** Optional list of multiprotocol ingest modes enabled for this connection. */
  MultiProtocolIngest?: MultiProtocolIngestOption[];
} & EaCVertexDetails;

/**
 * Schema for EaCDataConnectionDetails.
 *
 * Defines the base structure and validation for all data connection detail types.
 */
export const EaCDataConnectionDetailsSchema: z.ZodObject<{
  Type: z.ZodString;
  MultiProtocolIngest: z.ZodOptional<
    z.ZodArray<z.ZodEnum<['Default', 'HTTP', 'MQTT', 'WebSocket']>>
  >;
}> = EaCVertexDetailsSchema.extend({
  Type: z.string().describe('The type identifier for this data connection.'),
  MultiProtocolIngest: z
    .array(z.enum(MultiProtocolIngestOptions))
    .optional()
    .describe('Optional list of enabled multiprotocol ingest modes.'),
}).describe('Schema for base Data Connection details in EaC.');

/**
 * Type guard for EaCDataConnectionDetails.
 *
 * @param type - Optional type string to validate against.
 * @param conn - The object to validate.
 */
export function isEaCDataConnectionDetails<
  TType extends string | undefined = string,
>(type: TType, conn: unknown): conn is EaCDataConnectionDetails<TType> {
  if (!EaCDataConnectionDetailsSchema.safeParse(conn).success) return false;
  return !type || (conn as EaCDataConnectionDetails<TType>).Type === type;
}

/**
 * Validates and parses an object as EaCDataConnectionDetails.
 */
export function parseEaCDataConnectionDetails<
  TType extends string | undefined = string,
>(conn: unknown): EaCDataConnectionDetails<TType> {
  return EaCDataConnectionDetailsSchema.parse(
    conn,
  ) as EaCDataConnectionDetails<TType>;
}

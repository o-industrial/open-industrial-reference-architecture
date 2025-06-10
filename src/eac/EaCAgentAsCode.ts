import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import { EaCAgentDetails, EaCAgentDetailsSchema } from './EaCAgentDetails.ts';
import { EaCFlowNodeMetadata, EaCFlowNodeMetadataSchema } from './EaCFlowNodeMetadata.ts';

/**
 * Schema targeting configuration for an Agent.
 */
export type AgentSchemaSettings = {
  /** The lookup key for the schema this agent operates over. */
  SchemaLookup: string;
};

export type AgentWarmQuerySettings = {
  WarmQueryLookup: string;
};

/**
 * Represents an Agent in Everything as Code (EaC).
 *
 * Agents contain decision logic and operate over schemas via reflex-style evaluations.
 */
export type EaCAgentAsCode = EaCDetails<EaCAgentDetails> & {
  /** Flow canvas metadata (position and enabled state). */
  Metadata?: EaCFlowNodeMetadata;

  /** Target schema that this agent evaluates. */
  Schema?: AgentSchemaSettings;

  WarmQuery?: AgentWarmQuerySettings;
};

/**
 * Schema for EaCAgentAsCode — includes metadata and schema targeting configuration.
 */
export const EaCAgentAsCodeSchema: z.ZodType<EaCAgentAsCode> = EaCDetailsSchema.extend({
  Details: EaCAgentDetailsSchema.optional(),

  Metadata: EaCFlowNodeMetadataSchema.optional(),

  Schema: z
    .object({
      SchemaLookup: z.string(),
    })
    .optional()
    .describe('Required lookup key for the schema this agent evaluates.'),
  WarmQuery: z
    .object({
      SchemaLookup: z.string(),
    })
    .optional()
    .describe('Required lookup key for the schema this agent evaluates.'),
}).describe(
  'Schema for an agent node with reflex logic, targeting configuration, and canvas layout.',
);

/**
 * Type guard for EaCAgentAsCode.
 */
export function isEaCAgentAsCode(agent: unknown): agent is EaCAgentAsCode {
  return EaCAgentAsCodeSchema.safeParse(agent).success;
}

/**
 * Parses and validates an object as EaCAgentAsCode.
 */
export function parseEaCAgentAsCode(agent: unknown): EaCAgentAsCode {
  return EaCAgentAsCodeSchema.parse(agent);
}

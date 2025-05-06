import { z } from '../.deps.ts';
import { FieldMappingRule, FieldMappingRuleSchema } from './FieldMappingRule.ts';

export type JSONSchemaMap = Record<string, FieldMappingRule>;

/**
 * Zod schema for a JSONSchemaMap:
 * Maps target field names to FieldMappingRule definitions.
 */
export type JSONSchemaMapSchema = z.ZodRecord<
  z.ZodString,
  typeof FieldMappingRuleSchema
>;

export const JSONSchemaMapSchema: JSONSchemaMapSchema = z.record(FieldMappingRuleSchema);

import { z } from './.deps.ts';
import { EaCVertexDetails, EaCVertexDetailsSchema } from './.deps.ts';
import { EaCFlowNodeMetadata, EaCFlowNodeMetadataSchema } from './EaCFlowNodeMetadata.ts';

/**
 * Base structure for any surface- or node-level configuration
 * that can include visual metadata and optional runtime extensions.
 */
export type EaCFlowSettings = {
  /** Canvas metadata for position and enabled state. */
  Metadata?: EaCFlowNodeMetadata;
} & EaCVertexDetails;

/**
 * Schema for EaCFlowSettings.
 * Merges core vertex fields with flow node metadata.
 */
export const EaCFlowSettingsSchema: z.ZodObject<
  z.objectUtil.extendShape<
    {
      Description: z.ZodOptional<z.ZodString>;
      Name: z.ZodOptional<z.ZodString>;
    },
    {
      Metadata: z.ZodOptional<
        z.ZodType<EaCFlowNodeMetadata, z.ZodTypeDef, EaCFlowNodeMetadata>
      >;
    }
  >,
  'strip',
  z.ZodTypeAny,
  EaCFlowSettings,
  EaCFlowSettings
> = EaCVertexDetailsSchema.extend({
  Metadata: EaCFlowNodeMetadataSchema.optional(),
}).describe(
  'Flow-based node or setting configuration with visual and runtime metadata.',
);

/**
 * Type guard for EaCFlowSettings.
 */
export function isEaCFlowSettings(
  settings: unknown,
): settings is EaCFlowSettings {
  return EaCFlowSettingsSchema.safeParse(settings).success;
}

/**
 * Parses and validates an object as EaCFlowSettings.
 */
export function parseEaCFlowSettings(settings: unknown): EaCFlowSettings {
  return EaCFlowSettingsSchema.parse(settings);
}

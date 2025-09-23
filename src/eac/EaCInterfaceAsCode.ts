import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import { EaCInterfaceDetails, EaCInterfaceDetailsSchema } from './EaCInterfaceDetails.ts';
import { EaCFlowNodeMetadata, EaCFlowNodeMetadataSchema } from './EaCFlowNodeMetadata.ts';

/**
 * Everything-as-Code representation of an interface definition.
 */
export type EaCInterfaceAsCode = EaCDetails<EaCInterfaceDetails> & {
  Metadata?: EaCFlowNodeMetadata;
};

export const EaCInterfaceAsCodeSchema: z.ZodType<EaCInterfaceAsCode> = EaCDetailsSchema
  .extend({
    Details: EaCInterfaceDetailsSchema.optional(),
    Metadata: EaCFlowNodeMetadataSchema.optional(),
  })
  .describe('Interface definition with optional flow metadata for canvas placement.');

export function isEaCInterfaceAsCode(value: unknown): value is EaCInterfaceAsCode {
  return EaCInterfaceAsCodeSchema.safeParse(value).success;
}

export function parseEaCInterfaceAsCode(value: unknown): EaCInterfaceAsCode {
  return EaCInterfaceAsCodeSchema.parse(value);
}

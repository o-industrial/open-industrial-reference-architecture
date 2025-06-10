import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import { EaCWarmQueryDetails, EaCWarmQueryDetailsSchema } from './EaCWarmQueryDetails.ts';
import { EaCFlowNodeMetadata, EaCFlowNodeMetadataSchema } from './EaCFlowNodeMetadata.ts';
import { EaCFlowSettings } from './EaCFlowSettings.ts';

export type WarmQueryDataConnectionSettings = {
  /** Lookup key to the bound data connection. */
  Lookup: string;
};

export type EaCWarmQueryAsCode = EaCDetails<EaCWarmQueryDetails> & {
  Metadata?: EaCFlowNodeMetadata;

  ParentSurfaceLookup?: string;

  DataConnection?: WarmQueryDataConnectionSettings;
};

export type SurfaceWarmQuerySettings = {
  DisplayMode?: 'raw' | 'graph' | 'table';
} & EaCFlowSettings;

export const EaCWarmQueryAsCodeSchema: z.ZodType<EaCWarmQueryAsCode> = EaCDetailsSchema.extend({
  Details: EaCWarmQueryDetailsSchema.optional(),

  Metadata: EaCFlowNodeMetadataSchema.optional(),

  ParentSurfaceLookup: z.string().optional(),

  DataConnection: z
    .object({
      Lookup: z.string(),
    })
    .optional()
    .describe('Optional binding to a specific data connection.'),
}).describe(
  'Schema for a warm query node in the flow.',
);

export function isEaCWarmQueryAsCode(
  warmQuery: unknown,
): warmQuery is EaCWarmQueryAsCode {
  return EaCWarmQueryAsCodeSchema.safeParse(warmQuery).success;
}

export function parseEaCWarmQueryAsCode(warmQuery: unknown): EaCWarmQueryAsCode {
  return EaCWarmQueryAsCodeSchema.parse(warmQuery);
}

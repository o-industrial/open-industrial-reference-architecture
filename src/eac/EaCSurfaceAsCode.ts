import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import { EaCSurfaceDetails, EaCSurfaceDetailsSchema } from './EaCSurfaceDetails.ts';
import { EaCFlowSettings, EaCFlowSettingsSchema } from './EaCFlowSettings.ts';
import { EaCFlowNodeMetadata, EaCFlowNodeMetadataSchema } from './EaCFlowNodeMetadata.ts';

export type SurfaceWarmQuerySettings = {
  SchemaLookups?: string[];
  DataConnectionLookups?: string[];
} & EaCFlowSettings;

export type SurfaceInterfaceSettings = {
  SchemaLookups?: string[];
  WarmQueryLookups?: string[];
  DataConnectionLookups?: string[];
  Theme?: string;
  RefreshMs?: number;
} & EaCFlowSettings;

/**
 * Connection-specific runtime configuration used by a surface.
 */
export type SurfaceDataConnectionSettings = {
  TumblingWindowSeconds?: number;
} & EaCFlowSettings;

/**
 * Agent-specific surface rendering settings.
 */
export type SurfaceAgentSettings = {
  ShowHistory?: boolean;
} & EaCFlowSettings;

/**
 * Schema-specific surface rendering settings.
 */
export type SurfaceSchemaSettings = {
  DisplayMode?: 'raw' | 'graph' | 'table';
} & EaCFlowSettings;

/**
 * Child surface rendering or embedding settings.
 */
export type SurfaceChildSettings = {
  Collapsible?: boolean;
  DefaultCollapsed?: boolean;
} & EaCFlowSettings;

/**
 * Represents a Surface in Everything as Code (EaC).
 */
export type EaCSurfaceAsCode = EaCDetails<EaCSurfaceDetails> & {
  Metadata?: EaCFlowNodeMetadata;

  ParentSurfaceLookup?: string;

  DataConnections?: Record<string, SurfaceDataConnectionSettings>;
  Agents?: Record<string, SurfaceAgentSettings>;
  Schemas?: Record<string, SurfaceSchemaSettings>;
  Surfaces?: Record<string, SurfaceChildSettings>;
  WarmQueries?: Record<string, SurfaceWarmQuerySettings>;
  Interfaces?: Record<string, SurfaceInterfaceSettings>;
};

/**
 * Schema for EaCSurfaceAsCode — includes node metadata and embedded config maps.
 */
export const EaCSurfaceAsCodeSchema: z.ZodType<EaCSurfaceAsCode> = EaCDetailsSchema.extend({
  Details: EaCSurfaceDetailsSchema.optional(),

  Metadata: EaCFlowNodeMetadataSchema.optional(),

  ParentSurfaceLookup: z.string().optional(),

  DataConnections: z
    .record(
      EaCFlowSettingsSchema.extend({
        TumblingWindowSeconds: z.number().optional(),
      }).catchall(z.unknown()),
    )
    .optional(),

  Agents: z
    .record(
      EaCFlowSettingsSchema.extend({
        ShowHistory: z.boolean().optional(),
      }).catchall(z.unknown()),
    )
    .optional(),

  Schemas: z
    .record(
      EaCFlowSettingsSchema.extend({
        DisplayMode: z.enum(['raw', 'graph', 'table']).optional(),
      }).catchall(z.unknown()),
    )
    .optional(),

  Surfaces: z
    .record(
      EaCFlowSettingsSchema.extend({
        Collapsible: z.boolean().optional(),
        DefaultCollapsed: z.boolean().optional(),
      }).catchall(z.unknown()),
    )
    .optional(),

  WarmQueries: z
    .record(
      EaCFlowSettingsSchema.extend({
        SchemaLookups: z.array(z.string()).optional(),
        DataConnectionLookups: z.array(z.string()).optional(),
      }).catchall(z.unknown()),
    )
    .optional(),

  Interfaces: z
    .record(
      EaCFlowSettingsSchema.extend({
        SchemaLookups: z.array(z.string()).optional(),
        WarmQueryLookups: z.array(z.string()).optional(),
        DataConnectionLookups: z.array(z.string()).optional(),
        Theme: z.string().optional(),
        RefreshMs: z.number().optional(),
      }).catchall(z.unknown()),
    )
    .optional(),
}).describe(
  'Schema for a surface node in the flow, including visual metadata and attachment settings.',
);

/**
 * Type guard for EaCSurfaceAsCode.
 */
export function isEaCSurfaceAsCode(
  surface: unknown,
): surface is EaCSurfaceAsCode {
  return EaCSurfaceAsCodeSchema.safeParse(surface).success;
}

/**
 * Parses and validates an object as EaCSurfaceAsCode.
 */
export function parseEaCSurfaceAsCode(surface: unknown): EaCSurfaceAsCode {
  return EaCSurfaceAsCodeSchema.parse(surface);
}

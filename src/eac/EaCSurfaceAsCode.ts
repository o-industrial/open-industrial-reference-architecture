import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import { EaCSurfaceDetails, EaCSurfaceDetailsSchema } from './EaCSurfaceDetails.ts';
import { Position, PositionSchema } from './types/Position.ts';
import { EaCFlowNodeMetadata, EaCFlowNodeMetadataSchema } from './EaCFlowNodeMetadata.ts';

/**
 * Connection-specific runtime configuration used by a surface.
 */
export type SurfaceDataConnectionSettings = {
  Enabled?: boolean;
  TumblingWindowSeconds?: number;
  Position?: Position;
  [key: string]: unknown;
};

/**
 * Agent-specific surface rendering settings.
 */
export type SurfaceAgentSettings = {
  Enabled?: boolean;
  ShowHistory?: boolean;
  Position?: Position;
  [key: string]: unknown;
};

/**
 * Schema-specific surface rendering settings.
 */
export type SurfaceSchemaSettings = {
  Enabled?: boolean;
  DisplayMode?: 'raw' | 'graph' | 'table';
  Position?: Position;
  [key: string]: unknown;
};

/**
 * Child surface rendering or embedding settings.
 */
export type SurfaceChildSettings = {
  Enabled?: boolean;
  Collapsible?: boolean;
  DefaultCollapsed?: boolean;
  Position?: Position;
  [key: string]: unknown;
};

/**
 * Represents a Surface in Everything as Code (EaC).
 *
 * Surfaces are user-facing panels, tools, or dashboards — placed on flow canvases.
 */
export type EaCSurfaceAsCode = EaCDetails<EaCSurfaceDetails> & {
  /** Canvas/node runtime metadata for this surface. */
  Metadata?: EaCFlowNodeMetadata;

  /** Optional reference to a parent surface, if nested. */
  ParentSurfaceLookup?: string;

  /** Surface-level configuration for bound Data Connections. */
  DataConnections?: Record<string, SurfaceDataConnectionSettings>;

  /** Visual settings for Agents rendered on this surface. */
  Agents?: Record<string, SurfaceAgentSettings>;

  /** Visual display settings for attached Schemas. */
  Schemas?: Record<string, SurfaceSchemaSettings>;

  /** Configuration for embedded or child surfaces. */
  Surfaces?: Record<string, SurfaceChildSettings>;
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
      z
        .object({
          Enabled: z.boolean().optional(),
          TumblingWindowSeconds: z.number().optional(),
          Position: PositionSchema.optional(),
        })
        .catchall(z.unknown()),
    )
    .optional(),

  Agents: z
    .record(
      z
        .object({
          Enabled: z.boolean().optional(),
          ShowHistory: z.boolean().optional(),
          Position: PositionSchema.optional(),
        })
        .catchall(z.unknown()),
    )
    .optional(),

  Schemas: z
    .record(
      z
        .object({
          Enabled: z.boolean().optional(),
          DisplayMode: z.enum(['raw', 'graph', 'table']).optional(),
          Position: PositionSchema.optional(),
        })
        .catchall(z.unknown()),
    )
    .optional(),

  Surfaces: z
    .record(
      z
        .object({
          Enabled: z.boolean().optional(),
          Collapsible: z.boolean().optional(),
          DefaultCollapsed: z.boolean().optional(),
          Position: PositionSchema.optional(),
        })
        .catchall(z.unknown()),
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

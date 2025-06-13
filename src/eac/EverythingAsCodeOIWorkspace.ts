import {
  EaCWarmQueryAsCodeSchema,
  EverythingAsCodeClouds,
  EverythingAsCodeCloudsSchema,
  z,
} from './.deps.ts';
import { EaCAgentAsCode, EaCAgentAsCodeSchema } from './EaCAgentAsCode.ts';
import {
  EaCDataConnectionAsCode,
  EaCDataConnectionAsCodeSchema,
} from './EaCDataConnectionAsCode.ts';
import { EaCSchemaAsCode, EaCSchemaAsCodeSchema } from './EaCSchemaAsCode.ts';
import { EaCSurfaceAsCode, EaCSurfaceAsCodeSchema } from './EaCSurfaceAsCode.ts';
import { EaCSimulatorAsCode, EaCSimulatorAsCodeSchema } from './EaCSimulatorAsCode.ts';
import { EaCProposalConfigAsCode } from './EaCProposalConfigAsCode.ts';

/**
 * Options controlling impulse memory behavior at the workspace level.
 */
export type ImpulseOptions = {
  /** Optional seconds to retain impulse window for queries. */
  RetainWindowSeconds?: number;

  /** Optional DFS path for storing impulse logs. */
  StorePath?: string;

  /** Whether to auto-archive impulse history. */
  AutoArchive?: boolean;

  /** Whether impulse replay is allowed. */
  AllowReplay?: boolean;
};

/**
 * Options governing how signals behave at runtime.
 */
export type SignalOptions = {
  /** Defines where signals are stored (Memory, DFS, External). */
  Store?: 'Memory' | 'DFS' | 'External';

  /** Retention duration for signal memory (in seconds). */
  RetentionSeconds?: number;

  /** Whether to persist signals even if only triggered. */
  PersistOnTrigger?: boolean;

  /** Default shape emitted by this workspace's signals. */
  DefaultSignalShape?: 'event' | 'proposal' | 'patch';
};

/**
 * Represents the full Everything-as-Code (EaC) definition for an Open Industrial Workspace.
 *
 * Combines runtime memory, reflex agents, schema pipelines, and cloud/simulator bindings.
 */
export type EverythingAsCodeOIWorkspace = {
  /** Optional global runtime policies. */
  $GlobalOptions?: {
    Impulses?: ImpulseOptions;
    Signals?: SignalOptions;
  };

  /** Executable reflex agents mapped by ID. */
  Agents?: Record<string, EaCAgentAsCode>;

  /** External or streaming connections (MQTT, HTTP, etc.). */
  DataConnections?: Record<string, EaCDataConnectionAsCode>;

  /** Proposal configurations scoped for dynamic changes. */
  ProposalConfigs?: Record<string, EaCProposalConfigAsCode>;

  /** Stream or signal-backed schemas for memory. */
  Schemas?: Record<string, EaCSchemaAsCode>;

  /** Simulators used to inject or test impulses. */
  Simulators?: Record<string, EaCSimulatorAsCode>;

  /** Surfaces such as dashboards, panels, and visual UIs. */
  Surfaces?: Record<string, EaCSurfaceAsCode>;
} & EverythingAsCodeClouds;

export type EverythingAsCodeOIWorkspaceSchema = z.ZodObject<
  {
    $GlobalOptions: z.ZodOptional<
      z.ZodObject<{
        Impulses: z.ZodOptional<
          z.ZodObject<{
            RetainWindowSeconds: z.ZodOptional<z.ZodNumber>;
            StorePath: z.ZodOptional<z.ZodString>;
            AutoArchive: z.ZodOptional<z.ZodBoolean>;
            AllowReplay: z.ZodOptional<z.ZodBoolean>;
          }>
        >;
        Signals: z.ZodOptional<
          z.ZodObject<{
            Store: z.ZodOptional<z.ZodEnum<['Memory', 'DFS', 'External']>>;
            RetentionSeconds: z.ZodOptional<z.ZodNumber>;
            PersistOnTrigger: z.ZodOptional<z.ZodBoolean>;
            DefaultSignalShape: z.ZodOptional<
              z.ZodEnum<['event', 'proposal', 'patch']>
            >;
          }>
        >;
      }>
    >;

    Agents: z.ZodOptional<
      z.ZodRecord<z.ZodString, typeof EaCAgentAsCodeSchema>
    >;
    DataConnections: z.ZodOptional<
      z.ZodRecord<z.ZodString, typeof EaCDataConnectionAsCodeSchema>
    >;
    Schemas: z.ZodOptional<
      z.ZodRecord<z.ZodString, typeof EaCSchemaAsCodeSchema>
    >;
    Simulators: z.ZodOptional<
      z.ZodRecord<z.ZodString, typeof EaCSimulatorAsCodeSchema>
    >;
    Surfaces: z.ZodOptional<
      z.ZodRecord<z.ZodString, typeof EaCSurfaceAsCodeSchema>
    >;
    WarmQueries: z.ZodOptional<
      z.ZodRecord<z.ZodString, typeof EaCWarmQueryAsCodeSchema>
    >;
  },
  'strip',
  z.ZodTypeAny,
  EverythingAsCodeOIWorkspace,
  EverythingAsCodeOIWorkspace
>;

/**
 * Zod schema for `EverythingAsCodeOIWorkspace`.
 * Extends cloud resources with agent, schema, and surface integration.
 */
export const EverythingAsCodeOIWorkspaceSchema: EverythingAsCodeOIWorkspaceSchema =
  EverythingAsCodeCloudsSchema.extend({
    $GlobalOptions: z
      .object({
        Impulses: z
          .object({
            RetainWindowSeconds: z
              .number()
              .optional()
              .describe('How long impulse history is retained (seconds).'),
            StorePath: z
              .string()
              .optional()
              .describe('Filesystem or DFS path for impulse storage.'),
            AutoArchive: z
              .boolean()
              .optional()
              .describe('Whether to auto-archive impulse logs.'),
            AllowReplay: z
              .boolean()
              .optional()
              .describe('Whether impulse replay is allowed.'),
          })
          .optional()
          .describe('Options controlling impulse retention and behavior.'),
        Signals: z
          .object({
            Store: z
              .enum(['Memory', 'DFS', 'External'])
              .optional()
              .describe('Signal storage backend type.'),
            RetentionSeconds: z
              .number()
              .optional()
              .describe('How long signals are retained in memory.'),
            PersistOnTrigger: z
              .boolean()
              .optional()
              .describe('Whether to persist signals on trigger.'),
            DefaultSignalShape: z
              .enum(['event', 'proposal', 'patch'])
              .optional()
              .describe('Default shape emitted by signal definitions.'),
          })
          .optional()
          .describe('Options governing runtime signal behavior.'),
      })
      .optional()
      .describe('Global workspace-level options for memory behavior.'),

    Agents: z
      .record(EaCAgentAsCodeSchema)
      .optional()
      .describe('Reflex agents available to process impulses.'),

    DataConnections: z
      .record(EaCDataConnectionAsCodeSchema)
      .optional()
      .describe('Data sources (MQTT, HTTP, file) used to power schema memory.'),

    Schemas: z
      .record(EaCSchemaAsCodeSchema)
      .optional()
      .describe('Declarative schemas for mapping and storing data.'),

    Simulators: z
      .record(EaCSimulatorAsCodeSchema)
      .optional()
      .describe('Synthetic data sources or test signal emitters.'),

    Surfaces: z
      .record(EaCSurfaceAsCodeSchema)
      .optional()
      .describe('User-facing dashboards, panels, or apps.'),
  })
    .strip()
    .describe(
      'Everything-as-Code configuration for an Open Industrial workspace.',
    );

/**
 * Type guard for `EverythingAsCodeOIWorkspace`.
 */
export function isEverythingAsCodeOIWorkspace(
  value: unknown,
): value is EverythingAsCodeOIWorkspace {
  return EverythingAsCodeOIWorkspaceSchema.safeParse(value).success;
}

/**
 * Validates and parses an object as `EverythingAsCodeOIWorkspace`.
 */
export function parseEverythingAsCodeOIWorkspace(
  value: unknown,
): EverythingAsCodeOIWorkspace {
  return EverythingAsCodeOIWorkspaceSchema.parse(value);
}

import { z, EaCVertexDetails } from './.deps.ts';
import { EaCAgentAsCode, EaCAgentAsCodeSchema } from './EaCAgentAsCode.ts';
import {
  EaCDataConnectionAsCode,
  EaCDataConnectionAsCodeSchema,
} from './EaCDataConnectionAsCode.ts';
import { EaCSchemaAsCode, EaCSchemaAsCodeSchema } from './EaCSchemaAsCode.ts';
import { EaCSurfaceAsCode, EaCSurfaceAsCodeSchema } from './EaCSurfaceAsCode.ts';
import { EaCSimulatorAsCode, EaCSimulatorAsCodeSchema } from './EaCSimulatorAsCode.ts';
import { EaCProposalConfigAsCode } from './EaCProposalConfigAsCode.ts';
import { EaCWarmQueryAsCode, EaCWarmQueryAsCodeSchema } from './EaCWarmQueryAsCode.ts';

// Optional config types
export type ImpulseOptions = {
  RetainWindowSeconds?: number;
  StorePath?: string;
  AutoArchive?: boolean;
  AllowReplay?: boolean;
};

export type SignalOptions = {
  Store?: 'Memory' | 'DFS' | 'External';
  RetentionSeconds?: number;
  PersistOnTrigger?: boolean;
  DefaultSignalShape?: 'event' | 'proposal' | 'patch';
};

export type EverythingAsCodeOIWorkspace = {
  /** Optional global runtime policies */
  $GlobalOptions?: {
    Impulses?: ImpulseOptions;
    Signals?: SignalOptions;
  };

  /** Executable reflex agents */
  Agents?: Record<string, EaCAgentAsCode>;

  /** External or streaming connections */
  DataConnections?: Record<string, EaCDataConnectionAsCode>;

  /** Proposal configurations */
  ProposalConfigs?: Record<string, EaCProposalConfigAsCode>;

  /** Stream or file-backed input schemas */
  Schemas?: Record<string, EaCSchemaAsCode>;

  /** Simulators that drive impulse flows */
  Simulators?: Record<string, EaCSimulatorAsCode>;

  /** Panels, simulators, dashboards */
  Surfaces?: Record<string, EaCSurfaceAsCode>;

  WarmQueries?: Record<string, EaCWarmQueryAsCode>;
};

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

export const EverythingAsCodeOIWorkspaceSchema: EverythingAsCodeOIWorkspaceSchema =  z.object({
  $GlobalOptions: z
    .object({
      Impulses: z
        .object({
          RetainWindowSeconds: z.number().optional(),
          StorePath: z.string().optional(),
          AutoArchive: z.boolean().optional(),
          AllowReplay: z.boolean().optional(),
        })
        .optional(),
      Signals: z
        .object({
          Store: z.enum(['Memory', 'DFS', 'External']).optional(),
          RetentionSeconds: z.number().optional(),
          PersistOnTrigger: z.boolean().optional(),
          DefaultSignalShape: z
            .enum(['event', 'proposal', 'patch'])
            .optional(),
        })
        .optional(),
    })
    .optional(),

  Agents: z.record(EaCAgentAsCodeSchema).optional(),
  DataConnections: z.record(EaCDataConnectionAsCodeSchema).optional(),
  Schemas: z.record(EaCSchemaAsCodeSchema).optional(),
  Simulators: z.record(EaCSimulatorAsCodeSchema).optional(),
  Surfaces: z.record(EaCSurfaceAsCodeSchema).optional(),
  WarmQueries: z.record(EaCWarmQueryAsCodeSchema).optional(),
});

export function isEverythingAsCodeOIWorkspace(
  eac: unknown,
): eac is EverythingAsCodeOIWorkspace {
  return EverythingAsCodeOIWorkspaceSchema.safeParse(eac).success;
}

export function parseEverythingAsCodeOIWorkspace(
  eac: unknown,
): EverythingAsCodeOIWorkspace {
  return EverythingAsCodeOIWorkspaceSchema.parse(eac);
}

import {
  EverythingAsCodeOIWorkspace,
  EverythingAsCodeOIWorkspaceSchema,
  IoCContainer,
  z,
} from './.deps.ts';

import { WorkspaceDFSContextManager } from '../workspaces/WorkspaceDFSContextManager.ts';
import { WorkspaceConfig, WorkspaceConfigSchema } from './WorkspaceConfig.ts';

/**
 * Defines the full execution context for Workspace-related runtimes.
 * This is passed to SOPs, Pack initializers, step logic, and system integrations.
 *
 * @template TServices   Typed injected services object (default: Record<string, unknown>)
 * @template TAsCode     Scoped vertex context type (default: full EaC details)
 */
export type WorkspaceContext<
  TServices extends Record<string, unknown> = Record<string, unknown>,
> = {
  Config: WorkspaceConfig;

  EaC: EverythingAsCodeOIWorkspace;

  DFSs: WorkspaceDFSContextManager;

  IoC: IoCContainer;

  Secrets: {
    Get(key: string): Promise<string | undefined>;
    GetRequired(key: string): Promise<string>;
  };

  Services: TServices;
};

/**
 * Narrow subset of the runtime WorkspaceContext that can be printed or debugged.
 */
export type WorkspaceContextSubset = Omit<
  WorkspaceContext,
  'DFSs' | 'IoC' | 'Secrets' | 'Services'
>;

/**
 * Zod schema for runtime-safe printing of WorkspaceContext.
 */
export const WorkspaceContextSchema: z.ZodObject<
  {
    Config: z.ZodType<WorkspaceConfig, z.ZodTypeDef, WorkspaceConfig>;
    EaC: EverythingAsCodeOIWorkspaceSchema;
  },
  'strip',
  z.ZodTypeAny,
  WorkspaceContextSubset,
  WorkspaceContextSubset
> = z.object({
  Config: WorkspaceConfigSchema.describe('Loaded workspace.oi.jsonc config'),
  EaC: EverythingAsCodeOIWorkspaceSchema.describe(
    'Parsed Everything-as-Code model',
  ),
});

/**
 * Schema-validated introspection type.
 */
export type WorkspaceContextSchema = z.infer<typeof WorkspaceContextSchema>;

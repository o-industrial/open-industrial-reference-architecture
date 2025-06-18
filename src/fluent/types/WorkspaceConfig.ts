import { z } from './.deps.ts';

/**
 * Defines the structure of a workspace.oi.jsonc file used by Open Industrial runtimes.
 * This file declares the workspace's identity, runtime version, import map, and optional metadata.
 */
export type WorkspaceConfig = {
  /**
   * Optional list of module import aliases for this workspace.
   * Typically points to jsr URLs or Git repos.
   */
  Imports?: Record<string, string>;

  /**
   * Optional label describing the runtime environment (e.g., "dev", "lab", "prod").
   */
  Environment?: string;

  /**
   * Optional list of email addresses or user IDs responsible for this workspace.
   */
  Maintainers?: string[];

  /**
   * Optional list of default packs to auto-load via `.UsePack(...)`.
   */
  Packs?: string[];

  /**
   * Required name of the workspace, often scoped (e.g., "@org/my-workspace").
   */
  Name: string;

  /**
   * Required runtime version descriptor for compatibility across tooling.
   */
  Runtime: {
    Version: string;
  };

  /**
   * Required semantic version of the workspace (e.g., "1.0.0").
   */
  Version: string;
};

/**
 * Zod validation schema for `WorkspaceConfig`.
 * Ensures all required fields are present and well-formed.
 */
export const WorkspaceConfigSchema: z.ZodType<WorkspaceConfig> = z.object({
  Environment: z
    .string()
    .optional()
    .describe("Optional environment label, e.g. 'dev', 'lab', 'prod'."),

  Imports: z
    .record(z.string())
    .optional()
    .describe('Optional import alias map for resolving modules.'),

  Maintainers: z
    .array(z.string())
    .optional()
    .describe('List of maintainer email addresses or identifiers.'),

  Name: z
    .string()
    .min(1, 'Workspace name is required.')
    .describe("Unique scoped name for the workspace, e.g. '@org/workspace-name'."),

  Packs: z
    .array(z.string())
    .optional()
    .describe('Optional list of default pack identifiers to load on boot.'),

  Runtime: z.object({
    Version: z
      .string()
      .min(1, 'Runtime.Version is required.')
      .describe("Runtime implementation to use (e.g. '@o-industrial/runtimes/community')."),
  }),

  Version: z
    .string()
    .min(1, 'Workspace version is required.')
    .describe('Version of the workspace, used for compatibility.'),
});

/**
 * Inferred runtime type from WorkspaceConfigSchema.
 * Matches the validated structure used throughout Open Industrial systems.
 */
export type WorkspaceConfigSchema = z.infer<typeof WorkspaceConfigSchema>;

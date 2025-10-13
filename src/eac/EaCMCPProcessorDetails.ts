import { MCPHandshakeMetadata, z } from './.deps.ts';

/**
 * Declarative configuration for wiring an MCP processor into an Everything-as-Code workspace.
 */
export type EaCMCPProcessorDetails = {
  /** DFS lookup that hosts the MCP capability handlers (e.g., apps/mcp). */
  DFSLookup: string;

  /** Optional resolver path pattern to mount the MCP processor. Defaults to `'*'`. */
  PathPattern?: string;

  /** Optional resolver priority; higher values win during matching. */
  Priority?: number;

  /** Optional profile lookup used to reference shared MCP profile metadata. */
  ProfileLookup?: string;

  /** Optional handshake overrides that are merged into the runtime metadata. */
  Handshake?: Partial<MCPHandshakeMetadata>;
};

export const EaCMCPProcessorDetailsSchema: z.ZodType<EaCMCPProcessorDetails> = z
  .object({
    DFSLookup: z
      .string()
      .trim()
      .min(1, 'DFSLookup is required for MCP processors.'),
    PathPattern: z.string().trim().min(1).optional(),
    Priority: z.number().int().optional(),
    ProfileLookup: z.string().trim().min(1).optional(),
    Handshake: z
      .object({
        Id: z.string().trim().min(1).optional(),
        Name: z.string().trim().min(1).optional(),
        Version: z.string().trim().min(1).optional(),
        Description: z.string().trim().min(1).optional(),
        Provider: z.string().trim().min(1).optional(),
        Capabilities: z.record(z.string(), z.unknown()).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .describe('Configuration mapping an MCP processor DFS lookup to runtime resolver metadata.');

export function isEaCMCPProcessorDetails(
  value: unknown,
): value is EaCMCPProcessorDetails {
  return EaCMCPProcessorDetailsSchema.safeParse(value).success;
}

export function parseEaCMCPProcessorDetails(
  value: unknown,
): EaCMCPProcessorDetails {
  return EaCMCPProcessorDetailsSchema.parse(value);
}

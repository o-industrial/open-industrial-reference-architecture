import { Position, PositionSchema } from './types/Position.ts';
import { z } from './.deps.ts';

/**
 * Structural metadata for flow-based nodes in the Open Industrial canvas.
 * Includes runtime enablement and canvas positioning.
 */
export type EaCFlowNodeMetadata = {
  /** Whether the node is active in the workspace. */
  Enabled?: boolean;

  /** The visual canvas position for this node (x, y). */
  Position?: Position;
};

/**
 * Schema for EaCFlowNodeMetadata.
 */
export const EaCFlowNodeMetadataSchema: z.ZodType<EaCFlowNodeMetadata> = z
  .object({
    Enabled: z.boolean().optional(),
    Position: PositionSchema.optional(),
  })
  .describe(
    'Metadata fields for flow-based nodes, including visual position and enablement state.',
  );

/**
 * Type guard for EaCFlowNodeMetadata.
 */
export function isEaCFlowNodeMetadata(
  meta: unknown,
): meta is EaCFlowNodeMetadata {
  return EaCFlowNodeMetadataSchema.safeParse(meta).success;
}

/**
 * Parses and validates an object as EaCFlowNodeMetadata.
 */
export function parseEaCFlowNodeMetadata(meta: unknown): EaCFlowNodeMetadata {
  return EaCFlowNodeMetadataSchema.parse(meta);
}

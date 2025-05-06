import { z } from '../.deps.ts';

/**
 * Shared position structure for layout tracking.
 */
export type Position = {
  /** Horizontal canvas position */
  X: number;

  /** Vertical canvas position */
  Y: number;
};

/**
 * Zod schema for Position.
 */
export const PositionSchema: z.ZodType<Position> = z
  .object({
    X: z.number().describe('Horizontal canvas position'),
    Y: z.number().describe('Vertical canvas position'),
  })
  .describe('Canvas position tracking for flow-aligned nodes.');

/**
 * Type guard for Position.
 */
export function isPosition(pos: unknown): pos is Position {
  return PositionSchema.safeParse(pos).success;
}

/**
 * Parses and validates a Position object.
 */
export function parsePosition(pos: unknown): Position {
  return PositionSchema.parse(pos);
}

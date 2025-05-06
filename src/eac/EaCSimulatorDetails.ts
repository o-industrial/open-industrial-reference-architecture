import { EaCVertexDetails, EaCVertexDetailsSchema, z } from './.deps.ts';

/**
 * Represents the base details structure for a simulator in Everything as Code (EaC).
 *
 * Each simulator type (e.g., JSON, ImpulseStream, FileReplay) will extend this base.
 */
export type EaCSimulatorDetails<TType extends string | undefined = string> = {
  /** The simulator type identifier. */
  Type: TType;
} & EaCVertexDetails;

/**
 * Schema for EaCSimulatorDetails.
 */
export const EaCSimulatorDetailsSchema: z.ZodObject<{
  Type: z.ZodString;
}> = EaCVertexDetailsSchema.extend({
  Type: z.string().describe('The type identifier for this simulator.'),
}).describe('Schema for base simulator details in EaC.');

/**
 * Type guard for EaCSimulatorDetails.
 *
 * @param type - Optional expected simulator type.
 * @param sim - The object to check.
 */
export function isEaCSimulatorDetails<
  TType extends string | undefined = string,
>(type: TType, sim: unknown): sim is EaCSimulatorDetails<TType> {
  if (!EaCSimulatorDetailsSchema.safeParse(sim).success) return false;
  return !type || (sim as EaCSimulatorDetails<TType>).Type === type;
}

/**
 * Parses and validates an object as EaCSimulatorDetails.
 */
export function parseEaCSimulatorDetails<
  TType extends string | undefined = string,
>(sim: unknown): EaCSimulatorDetails<TType> {
  return EaCSimulatorDetailsSchema.parse(sim) as EaCSimulatorDetails<TType>;
}

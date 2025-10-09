import { EaCDetails, EaCDetailsSchema, z } from './.deps.ts';
import { EaCInterfaceDetails, EaCInterfaceDetailsSchema } from './EaCInterfaceDetails.ts';

/**
 * Everything-as-Code representation of an interface definition.
 */
export type EaCInterfaceAsCode = EaCDetails<EaCInterfaceDetails>;

export const EaCInterfaceAsCodeSchema: z.ZodType<EaCInterfaceAsCode> = EaCDetailsSchema
  .extend({
    Details: EaCInterfaceDetailsSchema.optional(),
  })
  .describe('Interface definition expressed as composable code blocks.');

export function isEaCInterfaceAsCode(value: unknown): value is EaCInterfaceAsCode {
  return EaCInterfaceAsCodeSchema.safeParse(value).success;
}

export function parseEaCInterfaceAsCode(value: unknown): EaCInterfaceAsCode {
  return EaCInterfaceAsCodeSchema.parse(value);
}

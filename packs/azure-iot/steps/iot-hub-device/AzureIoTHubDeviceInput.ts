import { z } from '../../.deps.ts';

export const AzureIoTHubDeviceInputSchema: z.ZodObject<{
  Devices: z.ZodRecord<
    z.ZodString,
    z.ZodObject<{
      IsIoTEdge: z.ZodOptional<z.ZodBoolean>;
    }>
  >;
}> = z.object({
  Devices: z.record(
    z.object({
      IsIoTEdge: z.boolean().optional(),
    }),
  ),
});

export type AzureIoTHubDeviceInput = z.infer<
  typeof AzureIoTHubDeviceInputSchema
>;

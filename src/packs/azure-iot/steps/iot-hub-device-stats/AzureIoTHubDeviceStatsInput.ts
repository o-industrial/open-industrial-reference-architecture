import { z } from '../../.deps.ts';

export const AzureIoTHubDeviceStatsInputSchema: z.ZodObject<{
  DeviceID: z.ZodString;
  SubscriptionID: z.ZodString;
  ResourceGroupName: z.ZodString;
  IoTHubName: z.ZodString;
}> = z.object({
  DeviceID: z.string(),
  SubscriptionID: z.string(),
  ResourceGroupName: z.string(),
  IoTHubName: z.string(),
});

export type AzureIoTHubDeviceStatsInput = z.infer<
  typeof AzureIoTHubDeviceStatsInputSchema
>;

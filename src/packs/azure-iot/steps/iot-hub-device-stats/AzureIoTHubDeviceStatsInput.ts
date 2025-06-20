import { z } from '../../.deps.ts';

export const AzureIoTHubDeviceStatsInputSchema = z.object({
  DeviceID: z.string(),
  SubscriptionID: z.string(),
  ResourceGroupName: z.string(),
  IoTHubName: z.string(),
});

export type AzureIoTHubDeviceStatsInput = z.infer<typeof AzureIoTHubDeviceStatsInputSchema>;

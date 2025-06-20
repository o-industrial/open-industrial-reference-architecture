import { z } from '../../.deps.ts';
import { DataConnectionStatsSchema } from '../../../oi-core/capabilities/connection/DataConnectionStats.ts';

export const AzureIoTHubDeviceStatsOutputSchema = DataConnectionStatsSchema;

export type AzureIoTHubDeviceStatsOutput = z.infer<
  typeof DataConnectionStatsSchema
>;

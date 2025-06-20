import {
  DataConnection,
  DataConnectionModuleBuilder,
  EaCAzureIoTHubDataConnectionDetails,
  EaCDataConnectionAsCode,
  Status,
} from '../.deps.ts';

import { AzureIoTHubDeviceStep } from '../steps/iot-hub-device/AzureIoTHubDeviceStep.ts';
import { AzureIoTHubDeviceStatsStep } from '../steps/iot-hub-device-stats/AzureIoTHubDeviceStatsStep.ts';
import { AzureIoTHubDeviceOutput } from '../steps/iot-hub-device/AzureIoTHubDeviceOutput.ts';
import { AzureIoTHubDeviceStatsOutput } from '../steps/iot-hub-device-stats/AzureIoTHubDeviceStatsOutput.ts';

export function AzureIoTHubDataConnection(
  lookup: string,
): DataConnectionModuleBuilder<
  EaCDataConnectionAsCode<EaCAzureIoTHubDataConnectionDetails>,
  AzureIoTHubDeviceOutput,
  Status,
  AzureIoTHubDeviceStatsOutput
> {
  return DataConnection<
    EaCAzureIoTHubDataConnectionDetails,
    EaCDataConnectionAsCode<EaCAzureIoTHubDataConnectionDetails>,
    AzureIoTHubDeviceOutput,
    Status,
    AzureIoTHubDeviceStatsOutput
  >(lookup)
    .Services((ctx, _ioc) => ({
      Skip: () => !ctx.AsCode.Metadata?.Enabled,
    }))
    .Steps(({ AsCode }) => ({
      IoT: AzureIoTHubDeviceStep.Build({
        CredentialStrategy: {
          Method: 'token',
        },
        ResourceGroupName: AsCode.Details?.ResourceGroupName!,
        SubscriptionID: AsCode.Details?.SubscriptionID!,
      }),
      IoTStats: AzureIoTHubDeviceStatsStep.Build(),
    }))
    .Verifications(({ Services }) => ({
      'skip-check': ({ Lookup }) => {
        if (Services.Skip()) {
          return `Skipping ${Lookup} due to metadata flag`;
        }
      },
    }))
    .Stats(async ({ Steps, AsCode }) => {
      return await Steps.IoTStats({
        DeviceID: AsCode.Details!.DeviceID!,
        SubscriptionID: AsCode.Details!.SubscriptionID!,
        ResourceGroupName: AsCode.Details!.ResourceGroupName!,
        IoTHubName: AsCode.Details!.IoTHubName!,
      });
    })
    .Run(async ({ Steps, AsCode }) => {
      const iot = await Steps.IoT({
        Devices: {
          [AsCode.Details!.DeviceID!]: {
            IsIoTEdge: AsCode.Details!.IsIoTEdge,
          },
        },
      });

      return iot;
    }) as unknown as DataConnectionModuleBuilder<
      EaCDataConnectionAsCode<EaCAzureIoTHubDataConnectionDetails>,
      AzureIoTHubDeviceOutput,
      Status,
      AzureIoTHubDeviceStatsOutput
    >;
}

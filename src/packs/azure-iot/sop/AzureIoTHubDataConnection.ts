import { AzureIoTHubDeviceStep } from '../steps/iot-hub-device/AzureIoTHubDeviceStep.ts';
import { AzureIoTHubDeviceStatsStep } from '../steps/iot-hub-device-stats/AzureIoTHubDeviceStatsStep.ts';
import {
  AzureIoTHubDeviceOutput,
  AzureIoTHubDeviceOutputSchema,
} from '../steps/iot-hub-device/AzureIoTHubDeviceOutput.ts';
import {
  AzureIoTHubDeviceStatsOutput,
  AzureIoTHubDeviceStatsOutputSchema,
} from '../steps/iot-hub-device-stats/AzureIoTHubDeviceStatsOutput.ts';
import { EaCAzureIoTHubDataConnectionDetails } from '../../../eac/EaCAzureIoTHubDataConnectionDetails.ts';
import { EaCDataConnectionAsCode } from '../../../eac/EaCDataConnectionAsCode.ts';
import { DataConnection } from '../../../fluent/connections/DataConnection.ts';
import { DataConnectionModuleBuilder } from '../../../fluent/connections/DataConnectionModuleBuilder.ts';

export function AzureIoTHubDataConnection(
  lookup: string,
): DataConnectionModuleBuilder<
  EaCDataConnectionAsCode<EaCAzureIoTHubDataConnectionDetails>,
  void,
  AzureIoTHubDeviceOutput,
  AzureIoTHubDeviceStatsOutput
> {
  return DataConnection<
    EaCAzureIoTHubDataConnectionDetails,
    EaCDataConnectionAsCode<EaCAzureIoTHubDataConnectionDetails>,
    void,
    AzureIoTHubDeviceOutput,
    AzureIoTHubDeviceStatsOutput
  >(lookup)
    .StatsType(AzureIoTHubDeviceStatsOutputSchema)
    .DeployType(AzureIoTHubDeviceOutputSchema)
    .Services((ctx, _ioc) => ({
      Skip: () => !ctx.AsCode.Metadata?.Enabled,
    }))
    .Steps(async ({ AsCode, Secrets }) => ({
      IoT: AzureIoTHubDeviceStep.Build({
        CredentialStrategy: {
          Method: 'clientSecret',
          TenantId: await Secrets.Get('AZURE_IOT_TENANT_ID'),
          ClientId: await Secrets.Get('AZURE_IOT_CLIENT_ID'),
          ClientSecret: await Secrets.Get('AZURE_IOT_CLIENT_SECRET'),
        },
        ResourceGroupName: AsCode.Details?.ResourceGroupName ||
          (await Secrets.Get('AZURE_IOT_RESOURCE_GROUP'))!,
        SubscriptionID: AsCode.Details?.SubscriptionID ||
          (await Secrets.Get('AZURE_IOT_SUBSCRIPTION_ID'))!,
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
    .Deploy(async ({ Steps, AsCode, Lookup, EaC }) => {
      const deviceId = AsCode.Details!.DeviceID!;
      const isIoTEdge = AsCode.Details!.IsIoTEdge ?? false;
      const workspaceLookup = EaC.EnterpriseLookup!;
      const dataConnectionLookup = Lookup;

      const iot = await Steps.IoT({
        WorkspaceLookup: workspaceLookup,
        Devices: {
          [deviceId]: {
            IsIoTEdge: isIoTEdge,
            DataConnectionLookup: dataConnectionLookup,
          },
        },
      });

      return iot;
    }) as unknown as DataConnectionModuleBuilder<
      EaCDataConnectionAsCode<EaCAzureIoTHubDataConnectionDetails>,
      void,
      AzureIoTHubDeviceOutput,
      AzureIoTHubDeviceStatsOutput
    >;
}

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
import { shaHash } from '../../../utils/shaHash.ts';
import { DataConnectionModuleBuilder } from '../../../fluent/connections/DataConnectionModuleBuilder.ts';
import { AzureResolveIoTHubConnectionStringStep } from '../steps/resolve-device-connection-string/AzureResolveIoTHubConnectionStringStep.ts';
import { AzureResolveCredentialInput } from '../steps/resolve-credential/AzureResolveCredentialInput.ts';

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
    .Steps(async ({ AsCode, Secrets }) => {
      const subId = AsCode.Details?.SubscriptionID ||
        (await Secrets.Get('AZURE_IOT_SUBSCRIPTION_ID'))!;

      const resGroupName = AsCode.Details?.ResourceGroupName ||
        (await Secrets.Get('AZURE_IOT_RESOURCE_GROUP'))!;

      const credStrat: AzureResolveCredentialInput = {
        Method: 'clientSecret',
        TenantId: await Secrets.Get('AZURE_IOT_TENANT_ID'),
        ClientId: await Secrets.Get('AZURE_IOT_CLIENT_ID'),
        ClientSecret: await Secrets.Get('AZURE_IOT_CLIENT_SECRET'),
      };

      return {
        IoT: AzureIoTHubDeviceStep.Build({
          CredentialStrategy: credStrat,
          ResourceGroupName: resGroupName,
          SubscriptionID: subId,
        }),
        IoTStats: AzureIoTHubDeviceStatsStep.Build({
          CredentialStrategy: credStrat,
          ResourceGroupName: resGroupName,
          SubscriptionID: subId,
        }),
        ResolveIoTHubConnectionString: AzureResolveIoTHubConnectionStringStep.Build({
          SubscriptionID: subId,
          CredentialStrategy: credStrat,
        }),
      };
    })
    .Verifications(({ Services }) => ({
      'skip-check': ({ Lookup }) => {
        if (Services.Skip()) {
          return `Skipping ${Lookup} due to metadata flag`;
        }
      },
    }))
    .Stats(async ({ Steps, Lookup, AsCode, EaC, Secrets }) => {
      const deviceId = await shaHash(EaC.EnterpriseLookup!, Lookup);

      const resGroupName = AsCode.Details?.ResourceGroupName ||
        (await Secrets.Get('AZURE_IOT_RESOURCE_GROUP'))!;

      const { IoTHubName } = await Steps!.ResolveIoTHubConnectionString({
        ResourceGroupName: resGroupName,
        KeyName: 'iothubowner',
      });

      return await Steps.IoTStats({
        DeviceID: deviceId,
        IoTHubName: IoTHubName,
      });
    })
    .Deploy(async ({ Steps, AsCode, Lookup, EaC }) => {
      const deviceId = Lookup;
      const isIoTEdge = AsCode.Details!.IsIoTEdge ?? false;
      const workspaceLookup = EaC.EnterpriseLookup!;

      const iot = await Steps.IoT({
        WorkspaceLookup: workspaceLookup,
        Devices: {
          [deviceId]: {
            IsIoTEdge: isIoTEdge,
            DataConnectionLookup: Lookup,
            DeviceName: AsCode.Details!.Name!,
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

import { Step } from '../../../../fluent/steps/Step.ts';
import { StepModuleBuilder } from '../../../../fluent/steps/StepModuleBuilder.ts';
import { AccessToken, IotHubClient, IoTRegistry } from '../../.deps.ts';

import { AzureResolveCredentialStep } from '../resolve-credential/AzureResolveCredentialStep.ts';

import {
  AzureIoTHubDeviceStatsInput,
  AzureIoTHubDeviceStatsInputSchema,
} from './AzureIoTHubDeviceStatsInput.ts';

import {
  AzureIoTHubDeviceStatsOutput,
  AzureIoTHubDeviceStatsOutputSchema,
} from './AzureIoTHubDeviceStatsOutput.ts';

type TStepBuilder = StepModuleBuilder<
  AzureIoTHubDeviceStatsInput,
  AzureIoTHubDeviceStatsOutput
>;

export const AzureIoTHubDeviceStatsStep: TStepBuilder = Step(
  'Azure IoT Hub Device Stats',
  'Fetches device connection stats and simulated telemetry from Azure IoT Hub',
)
  .Input(AzureIoTHubDeviceStatsInputSchema)
  .Output(AzureIoTHubDeviceStatsOutputSchema)
  .Steps(() => ({
    ResolveCredential: AzureResolveCredentialStep.Build(),
  }))
  .Services(async (input, ctx) => {
    const { SubscriptionID, ResourceGroupName, IoTHubName } = input;

    const { AccessToken } = await ctx.Steps!.ResolveCredential({
      Method: 'token',
    });

    const cred = {
      getToken: (): Promise<AccessToken> =>
        Promise.resolve({
          token: AccessToken,
          expiresOnTimestamp: Date.now() + 3600_000,
        }),
    };

    const iotClient = new IotHubClient(cred, SubscriptionID);

    const keys = await iotClient.iotHubResource.getKeysForKeyName(
      ResourceGroupName,
      IoTHubName,
      'iothubowner',
    );

    const connStr =
      `HostName=${IoTHubName}.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=${keys.secondaryKey}`;

    return {
      Registry: IoTRegistry.fromConnectionString(connStr),
    };
  })
  .Run(async (input, ctx) => {
    const { DeviceID, IoTHubName } = input;
    const { Registry } = ctx.Services;

    let twin;
    try {
      twin = await Registry.get(DeviceID);
    } catch {
      return {
        ImpulseRates: [0, 0, 0],
        HealthStatus: 'Unreachable',
        LastReceivedTimestamp: '',
        Metadata: {
          Error: 'Device not registered in IoT Hub',
          Status: '',
          Cloud: 'Azure',
          IoTHub: IoTHubName,
          DeviceID,
          Note: 'Not found',
        },
      } as AzureIoTHubDeviceStatsOutput;
    }

    const now = new Date();
    const lastReceived = new Date(now.getTime() - 60_000); // 1 min ago
    const impulseRates = [6.3, 25.7, 90.1]; // Stub

    const msSinceLast = now.getTime() - lastReceived.getTime();
    const health = msSinceLast < 90_000
      ? 'Healthy'
      : msSinceLast < 10 * 60_000
      ? 'Stale'
      : 'Unreachable';

    return {
      ImpulseRates: impulseRates,
      HealthStatus: health,
      LastReceivedTimestamp: lastReceived.toISOString(),
      Metadata: {
        Status: twin?.responseBody?.connectionState ?? '',
        Cloud: 'Azure',
        IoTHub: IoTHubName,
        DeviceID,
        Note: 'Stats from Azure IoT Hub + placeholder telemetry',
      },
    };
  }) as unknown as TStepBuilder;

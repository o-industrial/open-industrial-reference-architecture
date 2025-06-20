import { Step } from '../../../../fluent/steps/Step.ts';
import { StepModuleBuilder } from '../../../../fluent/steps/StepModuleBuilder.ts';
import { type AccessToken, IotHubClient, IoTRegistry } from '../../.deps.ts';
import { AzureResolveCredentialStep } from '../resolve-credential/AzureResolveCredentialStep.ts';
import { AzureIoTHubDeviceInput, AzureIoTHubDeviceInputSchema } from './AzureIoTHubDeviceInput.ts';
import {
  AzureIoTHubDeviceOptions,
  AzureIoTHubDeviceOptionsSchema,
} from './AzureIoTHubDeviceOptions.ts';
import {
  AzureIoTHubDeviceOutput,
  AzureIoTHubDeviceOutputSchema,
} from './AzureIoTHubDeviceOutput.ts';

type TStepBuilder = StepModuleBuilder<
  AzureIoTHubDeviceInput,
  AzureIoTHubDeviceOutput,
  AzureIoTHubDeviceOptions
>;

export const AzureIoTHubDeviceStep: TStepBuilder = Step(
  'Azure IoT Hub Device Provisioning',
  'Adds devices to an Azure IoT Hub',
)
  .Input(AzureIoTHubDeviceInputSchema)
  .Output(AzureIoTHubDeviceOutputSchema)
  .Options(AzureIoTHubDeviceOptionsSchema)
  .Steps(() => ({
    ResolveCredential: AzureResolveCredentialStep.Build(),
  }))
  .Services(async (_input, ctx, _ioc) => {
    const { SubscriptionID, ResourceGroupName, CredentialStrategy } = ctx.Options!;

    const { AccessToken } = await ctx.Steps!.ResolveCredential(
      CredentialStrategy,
    );

    const cred = {
      getToken: (): Promise<AccessToken> =>
        Promise.resolve({
          token: AccessToken,
          expiresOnTimestamp: Date.now() + 3600 * 1000, // 1 hour in the future
        }),
    };

    const iotClient = new IotHubClient(cred, SubscriptionID);

    const shortName = ResourceGroupName.split('-')
      .map((s) => s[0])
      .join('');

    const iotHubName = `${shortName}-iot-hub`;

    const keys = await iotClient.iotHubResource.getKeysForKeyName(
      ResourceGroupName,
      iotHubName,
      'iothubowner',
    );

    const connStr =
      `HostName=${iotHubName}.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=${keys.secondaryKey}`;

    const registry = IoTRegistry.fromConnectionString(connStr);

    return {
      IotClient: iotClient,
      Registry: registry,
    };
  })
  .Run(async (input, ctx) => {
    const { Devices } = input;
    const { Registry } = ctx.Services!;

    const provisioning = await Promise.all(
      Object.entries(Devices).map(async ([id, def]) => {
        try {
          await Registry.get(id); // Already exists
          return null;
        } catch (err) {
          if (!(err instanceof Error) || err.name !== 'DeviceNotFoundError') {
            throw err;
          }
        }

        return {
          deviceId: id,
          capabilities: { iotEdge: def.IsIoTEdge ?? false },
        };
      }),
    );

    // ⬇️ Correct the type explicitly here
    const toAdd = provisioning.filter(
      (d): d is { deviceId: string; capabilities: { iotEdge: boolean } } => d !== null,
    );

    if (toAdd.length === 0) {
      return { Message: 'All devices already exist.' };
    }

    const addResp = await Registry.addDevices(toAdd);
    const errors = addResp?.responseBody.errors ?? [];

    if (errors.length > 0) {
      const mapped = errors.reduce((acc, e) => {
        acc[e.deviceId] = {
          Error: e.errorCode.message,
          ErrorStatus: e.errorStatus,
        };
        return acc;
      }, {} as Record<string, unknown>);

      return { Errors: mapped };
    }

    return { Added: toAdd.map((d) => d.deviceId) };
  }) as unknown as TStepBuilder;

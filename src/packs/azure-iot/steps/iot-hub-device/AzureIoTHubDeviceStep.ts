// deno-lint-ignore-file no-explicit-any
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
          expiresOnTimestamp: Date.now() + 3600 * 1000,
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
    const { WorkspaceLookup, Devices } = input;
    const { Registry } = ctx.Services!;

    type DeviceDescription = {
      deviceId: string;
      capabilities: { iotEdge: boolean };
      tags: { WorkspaceLookup: string; DataConnectionLookup?: string };
    };

    const provisioning = await Promise.all(
      Object.entries(Devices).map(async ([id, def]) => {
        try {
          await Registry.get(id);
          return null;
        } catch (err) {
          if (!(err instanceof Error) || err.name !== 'DeviceNotFoundError') {
            throw err;
          }
        }

        const device: DeviceDescription = {
          deviceId: id,
          capabilities: { iotEdge: def.IsIoTEdge ?? false },
          tags: {
            WorkspaceLookup,
            ...(def.DataConnectionLookup && {
              DataConnectionLookup: def.DataConnectionLookup,
            }),
          },
        };

        return device;
      }),
    );

    const toAdd = provisioning.filter(
      (d): d is DeviceDescription => d !== null,
    );

    if (toAdd.length === 0) {
      return { Message: 'All devices already exist.' };
    }

    const addResp = await Registry.addDevices(toAdd);

    // Use `as any` fallback if type system doesn't guarantee `responseBody`
    const errors = (addResp as any)?.responseBody?.errors ?? [];

    if (errors.length > 0) {
      const mapped = errors.reduce((acc: Record<string, unknown>, e: any) => {
        acc[e.deviceId] = {
          Error: e.errorCode?.message ?? 'Unknown error',
          ErrorStatus: e.errorStatus,
        };
        return acc;
      }, {});

      return { Errors: mapped };
    }

    return { Added: toAdd.map((d) => d.deviceId) };
  }) as unknown as TStepBuilder;

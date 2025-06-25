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
  'Adds devices to an Azure IoT Hub and updates tags if needed',
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

    const toAdd: DeviceDescription[] = [];
    const toUpdate: {
      deviceId: string;
      etag: string;
      tags: Record<string, string>;
    }[] = [];

    await Promise.all(
      Object.entries(Devices).map(async ([id, def]) => {
        const desiredTags: Record<string, string> = {
          WorkspaceLookup,
          ...(def.DataConnectionLookup && {
            DataConnectionLookup: def.DataConnectionLookup,
          }),
        };

        try {
          const twin = (await Registry.getTwin(id)).responseBody;
          const currentTags = twin.tags ?? {};

          const tagMismatch = Object.entries(desiredTags).some(
            ([k, v]) => currentTags[k] !== v,
          );

          if (tagMismatch) {
            toUpdate.push({ deviceId: id, tags: desiredTags, etag: twin.etag });
          }
        } catch (err) {
          if (!(err instanceof Error) || err.name !== 'DeviceNotFoundError') {
            throw err;
          }

          const device: DeviceDescription = {
            deviceId: id,
            capabilities: { iotEdge: def.IsIoTEdge ?? false },
            tags: desiredTags as DeviceDescription['tags'],
          };

          toAdd.push(device);
        }
      }),
    );

    const results: Record<string, unknown> = {};

    if (toAdd.length > 0) {
      const addResp = await Registry.addDevices(toAdd);

      const errors = (addResp as any)?.responseBody?.errors ?? [];

      if (errors.length > 0) {
        results.Errors = errors.reduce(
          (acc: Record<string, unknown>, e: any) => {
            acc[e.deviceId] = {
              Error: e.errorCode?.message ?? 'Unknown error',
              ErrorStatus: e.errorStatus,
            };
            return acc;
          },
          {},
        );
      } else {
        results.Added = toAdd.map((d) => d.deviceId);
      }
    }

    for (const update of toUpdate) {
      await Registry.updateTwin(
        update.deviceId,
        { tags: update.tags },
        update.etag,
      );
    }

    if (toUpdate.length > 0) {
      results.Updated = toUpdate.map((u) => u.deviceId);
    }

    if (!results.Added && !results.Updated) {
      results.Message = 'All devices already exist and are up to date.';
    }

    return results;
  }) as unknown as TStepBuilder;

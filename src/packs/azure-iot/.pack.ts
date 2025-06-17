import { Pack } from '../../fluent/packs/Pack.ts';
import { PackModuleBuilder } from '../../fluent/packs/PackModuleBuilder.ts';
import { AzureIoTHubDeviceStep } from './steps/iot-hub-device/AzureIoTHubDeviceStep.ts';
import { AzureResolveCredentialStep } from './steps/resolve-credential/AzureResolveCredentialStep.ts';

export default Pack().Steps({
  AzureIoTHubDevice: AzureIoTHubDeviceStep.Build(),
  AzureResolveCredential: AzureResolveCredentialStep.Build(),
}) as PackModuleBuilder;

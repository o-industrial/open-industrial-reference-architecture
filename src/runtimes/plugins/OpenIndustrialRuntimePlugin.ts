import { IoCContainer } from 'https://jsr.io/@fathym/ioc/0.0.14/src/ioc/ioc.ts';
import { EaCRuntimeConfig, EaCRuntimePlugin, EaCRuntimePluginConfig } from '../.deps.ts';
import { OpenIndustrialEaC } from '../../flow/types/OpenIndustrialEaC.ts';

export default class OpenIndustrialRuntimePlugin implements EaCRuntimePlugin {
  constructor() {}

  public async Build(
    eac: OpenIndustrialEaC,
    ioc: IoCContainer,
    pluginCfg?: EaCRuntimePluginConfig<OpenIndustrialEaC>,
  ): Promise<void> {
    // TODO: Process OI EaC and generate the correct Application bindings to actually run the whole system... broken down by surfaces
  }

  public Setup(config: EaCRuntimeConfig) {
    const pluginConfig: EaCRuntimePluginConfig<OpenIndustrialEaC> = {
      Name: OpenIndustrialRuntimePlugin.name,
      Plugins: [],
    };

    return Promise.resolve(pluginConfig);
  }
}

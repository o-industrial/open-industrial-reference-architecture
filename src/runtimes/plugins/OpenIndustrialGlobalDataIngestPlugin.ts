import {
  EaCRuntimeConfig,
  EaCRuntimePlugin,
  EaCRuntimePluginConfig,
  IoCContainer,
} from '../.deps.ts';
import { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import { EaCGlobalDataIngestProcessorHandlerResolver } from '../processors/EaCGlobalDataIngestProcessorHandlerResolver.ts';
import { EaCGlobalDataIngestProcessor } from '../processors/EaCGlobalDataIngestProcessor.ts';

export class OpenIndustrialGlobalDataIngestPlugin implements EaCRuntimePlugin {
  constructor(
    protected projectLookup: string,
    protected natsServer: string,
    protected natsToken: string,
    protected eventHubConnStr: string,
    protected eventHubName: string,
    protected iotHubConnStr: string,
  ) {}

  public Setup(
    _config: EaCRuntimeConfig,
  ): Promise<EaCRuntimePluginConfig<EverythingAsCodeOIWorkspace>> {
    const pluginConfig: EaCRuntimePluginConfig<EverythingAsCodeOIWorkspace> = {
      Name: OpenIndustrialGlobalDataIngestPlugin.name,
      Plugins: [],
      IoC: new IoCContainer(),
      EaC: {
        Projects: {
          [this.projectLookup]: {
            ResolverConfigs: {},
            ApplicationResolvers: {
              global: {
                PathPattern: '/global*',
                Priority: 500,
              },
            },
          },
        },
        Applications: {
          global: {
            Processor: {
              Type: 'GlobalDataIngest',
              NATSServer: this.natsServer,
              NATSToken: this.natsToken,
              EventHubConsumerConnectionString: this.eventHubConnStr,
              EventHubName: this.eventHubName,
              IoTHubConnectionString: this.iotHubConnStr,
            } as EaCGlobalDataIngestProcessor,
          },
        },
      },
    };

    pluginConfig.IoC!.Register(
      () => EaCGlobalDataIngestProcessorHandlerResolver,
      {
        Name: 'EaCGlobalDataIngestProcessor',
        Type: pluginConfig.IoC!.Symbol('ProcessorHandlerResolver'),
      },
    );

    return Promise.resolve(pluginConfig);
  }
}

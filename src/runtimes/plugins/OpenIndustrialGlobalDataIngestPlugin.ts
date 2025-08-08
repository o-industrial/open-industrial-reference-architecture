import {
  EaCRuntimeConfig,
  EaCRuntimePlugin,
  EaCRuntimePluginConfig,
  IoCContainer,
} from '../.deps.ts';
import { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import { EaCGlobalDataIngestProcessorHandlerResolver } from '../processors/EaCGlobalDataIngestProcessorHandlerResolver.ts';
import { EaCGlobalDataIngestProcessor } from '../processors/EaCGlobalDataIngestProcessor.ts';
import { EaCOIImpulseStreamProcessorHandlerResolver } from '../processors/EaCOIImpulseStreamProcessorHandlerResolver.ts';
import { EaCOIImpulseStreamProcessor } from '../processors/EaCOIImpulseStreamProcessor.ts';

export class OpenIndustrialGlobalDataIngestPlugin implements EaCRuntimePlugin {
  constructor(
    protected projectLookup: string,
    protected natsServer: string,
    protected natsToken: string,
    protected eventHubConnStr: string,
    protected eventHubName: string,
    protected iotHubConnStr: string,
    protected oiSvcUrl: string,
    protected impulseStreamPath: string = '/api/workspaces/impulses/stream',
  ) {}

  public Setup(
    _config: EaCRuntimeConfig,
  ): Promise<EaCRuntimePluginConfig<EverythingAsCodeOIWorkspace>> {
    const impulseStreamApp = 'impulseStream';

    const pluginConfig: EaCRuntimePluginConfig<EverythingAsCodeOIWorkspace> = {
      Name: OpenIndustrialGlobalDataIngestPlugin.name,
      Plugins: [],
      IoC: new IoCContainer(),
      EaC: {
        Projects: {
          [this.projectLookup]: {
            ResolverConfigs: {},
            ApplicationResolvers: {
              globalDataIngest: {
                PathPattern: '/global*',
                Priority: 500,
              },
            },
          },
        },
        Applications: {
          globalDataIngest: {
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

    if (this.impulseStreamPath) {
      pluginConfig.EaC!.Projects![this.projectLookup].ApplicationResolvers[
        impulseStreamApp
      ] = {
        PathPattern: this.impulseStreamPath,
        Priority: 700,
      };

      pluginConfig.EaC!.Applications![impulseStreamApp] = {
        Processor: {
          Type: 'OIImpulseStream',
          NATSServer: this.natsServer,
          NATSToken: this.natsToken,
          OIServiceURL: this.oiSvcUrl,
        } as EaCOIImpulseStreamProcessor,
      };
    }

    pluginConfig.IoC!.Register(
      () => EaCGlobalDataIngestProcessorHandlerResolver,
      {
        Name: 'EaCGlobalDataIngestProcessor',
        Type: pluginConfig.IoC!.Symbol('ProcessorHandlerResolver'),
      },
    );

    pluginConfig.IoC!.Register(
      () => EaCOIImpulseStreamProcessorHandlerResolver,
      {
        Name: 'EaCOIImpulseStreamProcessor',
        Type: pluginConfig.IoC!.Symbol('ProcessorHandlerResolver'),
      },
    );

    return Promise.resolve(pluginConfig);
  }
}

import { EaCProjectResolverConfiguration } from 'jsr:@fathym/eac-applications@0.0.151';
import {
  EaCRuntimeConfig,
  EaCRuntimePlugin,
  EaCRuntimePluginConfig,
  IoCContainer,
} from '../.deps.ts';
import { EaCAgentAsCode } from '../../eac/EaCAgentAsCode.ts';
import { EaCDataConnectionAsCode } from '../../eac/EaCDataConnectionAsCode.ts';
import { EaCSchemaAsCode } from '../../eac/EaCSchemaAsCode.ts';
import { EaCSurfaceAsCode } from '../../eac/EaCSurfaceAsCode.ts';
import { OpenIndustrialEaC } from '../../flow/types/OpenIndustrialEaC.ts';
import { EaCOIDataConnectionProcessorHandlerResolver } from '../processors/EaCOIDataConnectionProcessorHandlerResolver.ts';
import { EaCGlobalDataIngestProcessorHandlerResolver } from '../processors/EaCGlobalDataIngestProcessorHandlerResolver.ts';
import { EaCGlobalDataIngestProcessor } from '../processors/EaCGlobalDataIngestProcessor.ts';

export class OpenIndustrialRuntimePlugin implements EaCRuntimePlugin {
  constructor(
    protected projectLookup: string,
    protected projectResolvers: Record<string, EaCProjectResolverConfiguration>,
    protected natsServer: string,
    protected eventHubConnStr: string,
    protected eventHubName: string,
  ) {}

  public async Build(
    eac: OpenIndustrialEaC,
    _ioc: IoCContainer,
    _pluginCfg?: EaCRuntimePluginConfig<OpenIndustrialEaC>,
  ): Promise<void> {
    await this.buildAppsForSurfaces(eac.EnterpriseLookup!, eac.Surfaces || {});
  }

  public Setup(
    _config: EaCRuntimeConfig,
  ): Promise<EaCRuntimePluginConfig<OpenIndustrialEaC>> {
    const pluginConfig: EaCRuntimePluginConfig<OpenIndustrialEaC> = {
      Name: OpenIndustrialRuntimePlugin.name,
      Plugins: [],
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
              EventHubConnectionString: this.eventHubConnStr,
              EventHubName: this.eventHubName,
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

    pluginConfig.IoC!.Register(
      () => EaCOIDataConnectionProcessorHandlerResolver,
      {
        Name: 'EaCOIDataConnectionProcessor',
        Type: pluginConfig.IoC!.Symbol('ProcessorHandlerResolver'),
      },
    );

    return Promise.resolve(pluginConfig);
  }

  protected async buildAppForAgent(
    _entLookup: string,
    _surfaceLookup: string,
    _agentLookup: string,
    _agent: EaCAgentAsCode,
  ): Promise<void> {
    // TODO(AI): Create a NATS-based Agent Processor for this agent
  }

  protected async buildAppForDataConnection(
    _entLookup: string,
    _surfaceLookup: string,
    _dataConnLookup: string,
    _dataConn: EaCDataConnectionAsCode,
  ): Promise<void> {
    // TODO(AI): Create and register IoT Hub listener mechanism for this data connection
  }

  protected async buildAppForSchema(
    _entLookup: string,
    _surfaceLookup: string,
    _schemaLookup: string,
    _schema: EaCSchemaAsCode,
  ): Promise<void> {
    // TODO(AI): Create a NATS-based Schema Processor for this schema
  }

  protected async buildAppsForAgents(
    entLookup: string,
    surfaceLookup: string,
    agents: Record<string, EaCAgentAsCode>,
  ): Promise<void> {
    for (const [agentLookup, agent] of Object.entries(agents)) {
      await this.buildAppForAgent(entLookup, surfaceLookup, agentLookup, agent);
    }
  }

  protected async buildAppsForDataConnections(
    entLookup: string,
    surfaceLookup: string,
    dataConnections: Record<string, EaCDataConnectionAsCode>,
  ): Promise<void> {
    for (const [dataConnLookup, dataConn] of Object.entries(dataConnections)) {
      await this.buildAppForDataConnection(
        entLookup,
        surfaceLookup,
        dataConnLookup,
        dataConn,
      );
    }
  }

  protected async buildAppsForSchemas(
    entLookup: string,
    surfaceLookup: string,
    schemas: Record<string, EaCSchemaAsCode>,
  ): Promise<void> {
    for (const [schemaLookup, schema] of Object.entries(schemas)) {
      await this.buildAppForSchema(
        entLookup,
        surfaceLookup,
        schemaLookup,
        schema,
      );
    }
  }

  protected async buildAppsForSurface(
    entLookup: string,
    surfaceLookup: string,
    surface: EaCSurfaceAsCode,
  ): Promise<void> {
    await this.buildAppsForDataConnections(
      entLookup,
      surfaceLookup,
      surface.DataConnections || {},
    );

    await this.buildAppsForSchemas(
      entLookup,
      surfaceLookup,
      surface.Schemas || {},
    );

    await this.buildAppsForAgents(
      entLookup,
      surfaceLookup,
      surface.Agents || {},
    );
  }

  protected async buildAppsForSurfaces(
    entLookup: string,
    surfaces: Record<string, EaCSurfaceAsCode>,
  ): Promise<void> {
    for (const [surfLookup, surface] of Object.entries(surfaces || {})) {
      await this.buildAppsForSurface(entLookup, surfLookup, surface);
    }
  }
}

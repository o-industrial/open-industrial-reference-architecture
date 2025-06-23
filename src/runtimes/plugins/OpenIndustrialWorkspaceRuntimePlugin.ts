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
import { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import { EaCOIDataConnectionProcessorHandlerResolver } from '../processors/EaCOIDataConnectionProcessorHandlerResolver.ts';
import { EaCOIDataConnectionProcessor } from '../processors/EaCOIDataConnectionProcessor.ts';

export class OpenIndustrialWorkspaceRuntimePlugin implements EaCRuntimePlugin {
  constructor(protected projectLookup: string, protected natsServer: string) {}

  public async Build(
    eac: EverythingAsCodeOIWorkspace,
    _ioc: IoCContainer,
    _pluginCfg?: EaCRuntimePluginConfig<EverythingAsCodeOIWorkspace>,
  ): Promise<void> {
    await this.buildAppsForSurfaces(eac, eac.Surfaces || {});
  }

  public Setup(
    _config: EaCRuntimeConfig,
  ): Promise<EaCRuntimePluginConfig<EverythingAsCodeOIWorkspace>> {
    const pluginConfig: EaCRuntimePluginConfig<EverythingAsCodeOIWorkspace> = {
      Name: OpenIndustrialWorkspaceRuntimePlugin.name,
      Plugins: [],
      IoC: new IoCContainer(),
      EaC: {
        Projects: {
          [this.projectLookup]: {
            ResolverConfigs: {},
            ApplicationResolvers: {},
          },
        },
      },
    };

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
    _eac: EverythingAsCodeOIWorkspace,
    _surfaceLookup: string,
    _agentLookup: string,
    _agent: EaCAgentAsCode,
  ): Promise<void> {
    // TODO(AI): Create a NATS-based Agent Processor for this agent
  }

  protected buildAppForDataConnection(
    eac: EverythingAsCodeOIWorkspace,
    surfaceLookup: string,
    dataConnLookup: string,
    dataConn: EaCDataConnectionAsCode,
  ): Promise<void> {
    const key = `${surfaceLookup}-${dataConnLookup}`;

    eac.Projects![this.projectLookup].ApplicationResolvers[key] = {
      PathPattern: `/surfaces/${surfaceLookup}/connections/${dataConnLookup}`,
      Priority: 500,
    };

    eac.Applications![key] = {
      Processor: {
        Type: 'OIDataConnection',
        DataConnection: dataConn,
        DataConnectionLookup: dataConnLookup,
        SurfaceLookup: surfaceLookup,
        NATSServer: this.natsServer,
      } as EaCOIDataConnectionProcessor,
    };

    return Promise.resolve();
  }

  protected async buildAppForSchema(
    _eac: EverythingAsCodeOIWorkspace,
    _surfaceLookup: string,
    _schemaLookup: string,
    _schema: EaCSchemaAsCode,
  ): Promise<void> {
    // TODO(AI): Create a NATS-based Schema Processor for this schema
    // const key = `${surfaceLookup}-${schemaLookup}`;
    // eac.Projects![this.projectLookup].ApplicationResolvers[key] = {
    //   PathPattern: `/surfaces/${surfaceLookup}/schemas/${schemaLookup}`,
    //   Priority: 500,
    // };
    // eac.Applications![key] = {
    //   Processor: {
    //     Type: 'OIDataConnection',
    //     DataConnection: dataConn,
    //     DataConnectionLookup: dataConnLookup,
    //     SurfaceLookup: surfaceLookup,
    //     NATSServer: 'http://localhost:4222',
    //   } as EaCOIDataConnectionProcessor,
    // };
  }

  protected async buildAppsForAgents(
    eac: EverythingAsCodeOIWorkspace,
    surfaceLookup: string,
    agents: Record<string, EaCAgentAsCode>,
  ): Promise<void> {
    for (const [agentLookup, agent] of Object.entries(agents)) {
      await this.buildAppForAgent(eac, surfaceLookup, agentLookup, agent);
    }
  }

  protected async buildAppsForDataConnections(
    eac: EverythingAsCodeOIWorkspace,
    surfaceLookup: string,
    dataConnections: Record<string, EaCDataConnectionAsCode>,
  ): Promise<void> {
    for (const [dataConnLookup, dataConn] of Object.entries(dataConnections)) {
      await this.buildAppForDataConnection(
        eac,
        surfaceLookup,
        dataConnLookup,
        dataConn,
      );
    }
  }

  protected async buildAppsForSchemas(
    eac: EverythingAsCodeOIWorkspace,
    surfaceLookup: string,
    schemas: Record<string, EaCSchemaAsCode>,
  ): Promise<void> {
    for (const [schemaLookup, schema] of Object.entries(schemas)) {
      await this.buildAppForSchema(eac, surfaceLookup, schemaLookup, schema);
    }
  }

  protected async buildAppsForSurface(
    eac: EverythingAsCodeOIWorkspace,
    surfaceLookup: string,
    surface: EaCSurfaceAsCode,
  ): Promise<void> {
    await this.buildAppsForDataConnections(
      eac,
      surfaceLookup,
      surface.DataConnections || {},
    );

    await this.buildAppsForSchemas(eac, surfaceLookup, surface.Schemas || {});

    await this.buildAppsForAgents(eac, surfaceLookup, surface.Agents || {});
  }

  protected async buildAppsForSurfaces(
    eac: EverythingAsCodeOIWorkspace,
    surfaces: Record<string, EaCSurfaceAsCode>,
  ): Promise<void> {
    for (const [surfLookup, surface] of Object.entries(surfaces || {})) {
      await this.buildAppsForSurface(eac, surfLookup, surface);
    }
  }
}

import {
  EaCRuntimeConfig,
  EaCRuntimePlugin,
  EaCRuntimePluginConfig,
  IoCContainer,
} from '../.deps.ts';
import { EaCAgentAsCode } from '../../eac/EaCAgentAsCode.ts';
import { EaCDataConnectionAsCode } from '../../eac/EaCDataConnectionAsCode.ts';
import { EaCInterfaceDetails } from '../../eac/EaCInterfaceDetails.ts';
import { EaCSchemaAsCode } from '../../eac/EaCSchemaAsCode.ts';
import { EaCSurfaceAsCode } from '../../eac/EaCSurfaceAsCode.ts';
import { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import { EaCOIDataConnectionProcessorHandlerResolver } from '../processors/EaCOIDataConnectionProcessorHandlerResolver.ts';
import { EaCInterfaceAppProcessorHandlerResolver } from '../processors/EaCInterfaceAppProcessorHandlerResolver.ts';
import { EaCOIDataConnectionProcessor } from '../processors/EaCOIDataConnectionProcessor.ts';
import { EaCInterfaceAppProcessor } from '../processors/EaCInterfaceAppProcessor.ts';
import { EaCMCPProcessorDetails } from '../../eac/EaCMCPProcessorDetails.ts';
import { EaCModelContextProtocolProcessor } from '@fathym/eac-applications/processors';
import { EaCModelContextProtocolProcessorHandlerResolver } from '@fathym/eac-applications/runtime/processors';

export class OpenIndustrialWorkspaceRuntimePlugin implements EaCRuntimePlugin {
  constructor(
    protected projectLookup: string,
    protected natsServer: string,
    protected natsToken: string,
  ) {}

  public async Build(
    eac: EverythingAsCodeOIWorkspace,
    _ioc: IoCContainer,
    _pluginCfg?: EaCRuntimePluginConfig<EverythingAsCodeOIWorkspace>,
  ): Promise<void> {
    this.ensureProjectScaffolding(eac);

    await this.buildWorkspaceInterfaceApp(eac);
    await this.buildMCPProcessors(eac, eac.MCPProcessors || {});
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

    pluginConfig.IoC!.Register(
      () => EaCInterfaceAppProcessorHandlerResolver,
      {
        Name: 'EaCInterfaceAppProcessor',
        Type: pluginConfig.IoC!.Symbol('ProcessorHandlerResolver'),
      },
    );

    pluginConfig.IoC!.Register(
      () => EaCModelContextProtocolProcessorHandlerResolver,
      {
        Name: 'EaCModelContextProtocolProcessor',
        Type: pluginConfig.IoC!.Symbol('ProcessorHandlerResolver'),
      },
    );

    return Promise.resolve(pluginConfig);
  }

  protected ensureProjectScaffolding(eac: EverythingAsCodeOIWorkspace): void {
    eac.Applications ??= {};
    eac.Projects ??= {};

    if (!eac.Projects[this.projectLookup]) {
      eac.Projects[this.projectLookup] = {
        ResolverConfigs: {},
        ApplicationResolvers: {},
      };
    }

    const project = eac.Projects[this.projectLookup]!;
    project.ResolverConfigs ??= {};
    project.ApplicationResolvers ??= {};
  }

  protected buildWorkspaceInterfaceApp(
    eac: EverythingAsCodeOIWorkspace,
  ): Promise<void> {
    const interfaceEntries = Object.entries(eac.Interfaces ?? {})
      .map(([lookup, iface]) => {
        const details = iface?.Details;
        return details ? [lookup, { Details: details }] : undefined;
      })
      .filter((entry): entry is [string, { Details: EaCInterfaceDetails }] => Array.isArray(entry));

    if (!interfaceEntries.length) {
      return Promise.resolve();
    }

    const project = eac.Projects![this.projectLookup]!;
    const resolverKey = 'workspaceInterfaces';
    const dfsLookup = `${this.projectLookup}-workspace-interfaces`;

    project.ApplicationResolvers![resolverKey] = project.ApplicationResolvers![resolverKey] ?? {
      PathPattern: '/w/:workspace/ui/:interface',
      Priority: 450,
    };

    eac.Applications![resolverKey] = {
      Metadata: {
        Interfaces: Object.fromEntries(interfaceEntries),
      },
      Processor: {
        Type: 'InterfaceApp',
        AppDFSLookup: dfsLookup,
        RoutesBase: 'w/:workspace/ui',
      } as EaCInterfaceAppProcessor,
    };

    return Promise.resolve();
  }

  protected buildMCPProcessors(
    eac: EverythingAsCodeOIWorkspace,
    processors: Record<string, EaCMCPProcessorDetails>,
  ): Promise<void> {
    if (!processors || !Object.keys(processors).length) {
      return Promise.resolve();
    }

    const project = eac.Projects![this.projectLookup]!;

    project.ApplicationResolvers ??= {};

    for (const [lookup, config] of Object.entries(processors)) {
      const existingResolver = project.ApplicationResolvers![lookup] ?? {};

      project.ApplicationResolvers![lookup] = {
        PathPattern: config.PathPattern ?? existingResolver.PathPattern ?? '*',
        Priority: config.Priority ?? existingResolver.Priority ?? 700,
      };

      const existingApp = eac.Applications![lookup] ?? {};
      const existingProcessor = existingApp.Processor as
        | EaCModelContextProtocolProcessor
        | undefined;

      const nextProcessor: EaCModelContextProtocolProcessor = {
        ...(existingProcessor ?? {}),
        Type: 'MCP',
        DFSLookup: config.DFSLookup,
        ProfileLookup: config.ProfileLookup ??
          existingProcessor?.ProfileLookup,
      };

      const existingOptions = isRecord(existingProcessor?.Options)
        ? { ...(existingProcessor!.Options as Record<string, unknown>) }
        : undefined;

      if (config.Handshake) {
        const existingHandshake = isRecord(existingOptions?.['handshake'])
          ? existingOptions?.['handshake'] as Record<string, unknown>
          : undefined;

        const handshakeOption = existingHandshake
          ? {
            ...existingHandshake,
          }
          : {};

        Object.assign(handshakeOption, config.Handshake);

        const mergedOptions = existingOptions ?? {};
        mergedOptions['handshake'] = handshakeOption;
        nextProcessor.Options = mergedOptions;
      } else if (existingOptions) {
        nextProcessor.Options = existingOptions;
      }

      const nextApplication = {
        ...existingApp,
        Processor: nextProcessor,
      };

      const needsDetails = config.Handshake?.Name !== undefined ||
        config.Handshake?.Description !== undefined ||
        !nextApplication.Details;

      if (needsDetails) {
        const details = {
          ...(nextApplication.Details ?? {}),
        } as MutableApplicationDetails;

        if (config.Handshake?.Name) {
          details.Name = config.Handshake.Name;
        } else if (typeof details.Name !== 'string') {
          details.Name = `MCP Processor (${lookup})`;
        }

        if (config.Handshake?.Description) {
          details.Description = config.Handshake.Description;
        }

        nextApplication.Details = details as typeof nextApplication.Details;
      }

      eac.Applications![lookup] = nextApplication;
    }

    return Promise.resolve();
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
        NATSToken: this.natsToken,
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

type MutableApplicationDetails = {
  Name?: string;
  Description?: string;
  [key: string]: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

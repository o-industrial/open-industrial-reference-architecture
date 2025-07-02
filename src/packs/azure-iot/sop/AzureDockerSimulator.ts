import { Simulator } from '../../../fluent/simulators/Simulator.ts';
import { EaCSimulatorAsCode } from '../../../eac/EaCSimulatorAsCode.ts';
import { EaCAzureDockerSimulatorDetails } from '../../../eac/EaCAzureDockerSimulatorDetails.ts';
import { SimulatorModuleBuilder } from '../../../fluent/simulators/SimulatorModuleBuilder.ts';
import {
  AzureContainerAppJobDeployOutput,
  AzureContainerAppJobDeployOutputSchema,
  AzureContainerAppJobDeployStep,
} from '../steps/container-app-job-deploy/AzureContainerAppJobDeployStep.ts';
import {
  AzureContainerAppJobStatsOutput,
  AzureContainerAppJobStatsOutputSchema,
  AzureContainerAppJobStatsStep,
} from '../steps/container-app-job-stats/AzureContainerAppJobStatsStep.ts';
import { AzureResolveCredentialInput } from '../steps/resolve-credential/AzureResolveCredentialInput.ts';
import { WorkspaceEnsureAzureResourceGroupStep } from '../steps/ensure-workspace-resource-group/WorkspaceEnsureAzureResourceGroupStep.ts';
import { shaHash } from '../../../utils/shaHash.ts';
import { isEaCAzureIoTHubDataConnectionDetails } from '../../../eac/EaCAzureIoTHubDataConnectionDetails.ts';
import { AzureResolveIoTHubConnectionStringStep } from '../steps/resolve-device-connection-string/AzureResolveIoTHubConnectionStringStep.ts';
import { z } from '../.deps.ts';

export async function safeAppName(
  workspace: string,
  id: string,
  prefix: string,
): Promise<string> {
  const hash = await shaHash(workspace, id);

  const shortHash = hash.substring(0, 20);

  return `${prefix}-${shortHash}`;
}

export function AzureDockerSimulator(
  lookup: string,
): SimulatorModuleBuilder<
  EaCSimulatorAsCode<EaCAzureDockerSimulatorDetails>,
  void,
  AzureContainerAppJobDeployOutput[],
  AzureContainerAppJobStatsOutput
> {
  return Simulator<
    EaCAzureDockerSimulatorDetails,
    EaCSimulatorAsCode<EaCAzureDockerSimulatorDetails>,
    void,
    AzureContainerAppJobDeployOutput[],
    AzureContainerAppJobStatsOutput
  >(lookup)
    .Steps(async ({ Secrets }) => {
      const subId = (await Secrets.Get('AZURE_IOT_SUBSCRIPTION_ID'))!;

      const credStrat: AzureResolveCredentialInput = {
        Method: 'clientSecret',
        TenantId: await Secrets.Get('AZURE_IOT_TENANT_ID'),
        ClientId: await Secrets.Get('AZURE_IOT_CLIENT_ID'),
        ClientSecret: await Secrets.Get('AZURE_IOT_CLIENT_SECRET'),
      };

      return {
        EnsureResGroup: WorkspaceEnsureAzureResourceGroupStep.Build({
          CredentialStrategy: credStrat,
          SubscriptionID: subId,
        }),
        DeployJob: AzureContainerAppJobDeployStep.Build({
          CredentialStrategy: credStrat,
          SubscriptionID: subId,
        }),
        StatsJob: AzureContainerAppJobStatsStep.Build({
          CredentialStrategy: credStrat,
          SubscriptionID: subId,
        }),
        ResolveIoTHubConnectionString: AzureResolveIoTHubConnectionStringStep.Build({
          SubscriptionID: subId,
          CredentialStrategy: credStrat,
        }),
      };
    })
    .Services(
      async ({ Lookup, EaC: { EnterpriseLookup: WorkspaceLookup } }) => {
        return {
          ApplicationName: await safeAppName(
            WorkspaceLookup!,
            `simulator-azure-docker-${Lookup}`,
            'sim-az-dckr',
          ),
          AppEnvironmentName: 'simulator-container-app-env',
        };
      },
    )
    .StatsType(AzureContainerAppJobStatsOutputSchema)
    .Stats(async ({ Steps, EaC, Services: { ApplicationName } }) => {
      const ensured = await Steps.EnsureResGroup({
        WorkspaceLookup: EaC.EnterpriseLookup!,
      });

      return await Steps.StatsJob({
        ResourceGroupName: ensured.ResourceGroupName,
        AppName: ApplicationName,
      });
    })
    .DeployType(z.array(AzureContainerAppJobDeployOutputSchema))
    .Deploy(
      async ({
        Steps,
        AsCode,
        Lookup: SimulatorLookup,
        EaC,
        Secrets,
        Services: { AppEnvironmentName, ApplicationName },
      }) => {
        const {
          MessageTemplate,
          Variables,
          MessageIntervalMS,
          MessageCountPerDevice,
        } = AsCode.Details ?? {};

        const ensured = await Steps.EnsureResGroup({
          WorkspaceLookup: EaC.EnterpriseLookup!,
        });

        //  Load any Data Connectin that points at this Simulator, and for every data connection that points at this simulator, Deploy a configured job

        type t = Parameters<(typeof Steps)['DeployJob']>[0];

        const jobs: t[] = [];

        for (const [dcLookup, dc] of Object.entries(EaC.DataConnections!)) {
          const dcDetails = dc.Details ?? {};

          if (
            dc.SimulatorLookup === SimulatorLookup &&
            isEaCAzureIoTHubDataConnectionDetails(dcDetails)
          ) {
            const { ConnectionString } = await Steps.ResolveIoTHubConnectionString({
              ResourceGroupName: await Secrets.GetRequired(
                'AZURE_IOT_RESOURCE_GROUP',
              ),
              KeyName: 'iothubowner',
            });

            const deviceId = await shaHash(
              EaC.EnterpriseLookup!,
              dcDetails.DeviceID,
            );

            jobs.push({
              ResourceGroupName: ensured.ResourceGroupName,
              AppEnvironmentName: AppEnvironmentName,
              AppName: ApplicationName,
              Image: 'mcr.microsoft.com/oss/azure-samples/azureiot-telemetrysimulator:latest',
              Tags: {
                WorkspaceLookup: EaC.EnterpriseLookup!,
                SimulatorLookup: SimulatorLookup,
                DataConnectionLookup: dcLookup,
              },
              EnvironmentVariables: {
                IotHubConnectionString: ConnectionString, //deviceConnStr,
                DeviceList: deviceId,
                MessageCount: (MessageCountPerDevice || 0).toString(),
                Interval: (MessageIntervalMS || 60000).toString(),
                Template: MessageTemplate ? JSON.stringify(MessageTemplate) : '',
                Variables: Variables ? JSON.stringify(Variables) : '',
              },
            });
          }
        }

        return await Promise.all(jobs.map((job) => Steps.DeployJob(job)));
      },
    ) as unknown as SimulatorModuleBuilder<
      EaCSimulatorAsCode<EaCAzureDockerSimulatorDetails>,
      void,
      AzureContainerAppJobDeployOutput[],
      AzureContainerAppJobStatsOutput
    >;
}

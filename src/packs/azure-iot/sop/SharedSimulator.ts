import { Simulator } from '../../../fluent/simulators/Simulator.ts';
import { SimulatorModuleBuilder } from '../../../fluent/simulators/SimulatorModuleBuilder.ts';
import { EaCSimulatorAsCode } from '../../../eac/EaCSimulatorAsCode.ts';
import { EaCSharedSimulatorDetails } from '../../../eac/EaCSharedSimulatorDetails.ts';
import { z } from '../.deps.ts';
import { isEaCAzureIoTHubDataConnectionDetails } from '../../../eac/EaCAzureIoTHubDataConnectionDetails.ts';
import { AzureResolveIoTHubConnectionStringStep } from '../steps/resolve-device-connection-string/AzureResolveIoTHubConnectionStringStep.ts';
import { AzureResolveCredentialInput } from '../steps/resolve-credential/AzureResolveCredentialInput.ts';
import { WorkspaceEnsureAzureResourceGroupStep } from '../steps/ensure-workspace-resource-group/WorkspaceEnsureAzureResourceGroupStep.ts';
import { shaHash } from '../../../utils/shaHash.ts';

export function SharedSimulator(
  lookup: string,
): SimulatorModuleBuilder<
  EaCSimulatorAsCode<EaCSharedSimulatorDetails>,
  void,
  void,
  { RoutesCount: number; LastSeenUTC?: string }
> {
  return Simulator<
    EaCSharedSimulatorDetails,
    EaCSimulatorAsCode<EaCSharedSimulatorDetails>,
    void,
    void,
    { RoutesCount: number; LastSeenUTC?: string }
  >(lookup)
    .DeployType(z.void())
    .StatsType(
      z.object({ RoutesCount: z.number(), LastSeenUTC: z.string().optional() }),
    )
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
        ResolveIoTHubConnectionString: AzureResolveIoTHubConnectionStringStep.Build({
          SubscriptionID: subId,
          CredentialStrategy: credStrat,
        }),
      };
    })
    .Stats(({ EaC, Lookup }) => {
      // TODO(AI): query relay metrics storage for this (EnterpriseLookup, Lookup)
      void EaC;
      void Lookup;
      return Promise.resolve({ RoutesCount: 0 });
    })
    .Deploy(async ({ Steps, AsCode, EaC, Secrets, Lookup: SimulatorLookup }) => {
      const { Source } = AsCode.Details!;
      const sourceConn = await Steps.ResolveIoTHubConnectionString({
        ResourceGroupName: await Secrets.GetRequired(
          'AZURE_IOT_RESOURCE_GROUP',
        ),
        KeyName: 'iothubowner',
      });

      const subscribers: Array<{
        WorkspaceLookup: string;
        DcLookup: string;
        TargetHubConnStrSecretRef: string;
        TargetDeviceID: string;
      }> = [];

      for (const [dcLookup, dc] of Object.entries(EaC.DataConnections ?? {})) {
        const dcDetails = dc.Details ?? {};
        if (
          dc.SimulatorLookup === SimulatorLookup &&
          isEaCAzureIoTHubDataConnectionDetails(dcDetails)
        ) {
          const targetConn = await Steps.ResolveIoTHubConnectionString({
            ResourceGroupName: await Secrets.GetRequired(
              'AZURE_IOT_RESOURCE_GROUP',
            ),
            KeyName: 'iothubowner',
          });

          const targetDeviceId = await shaHash(
            EaC.EnterpriseLookup!,
            SimulatorLookup,
          );

          subscribers.push({
            WorkspaceLookup: EaC.EnterpriseLookup!,
            DcLookup: dcLookup,
            TargetHubConnStrSecretRef: targetConn.ConnectionString,
            TargetDeviceID: targetDeviceId,
          });
        }
      }

      // Ensure shared relay infra (Function App) exists once-per-env (idempotent)
      // TODO(AI): EnsureOrCreateFunctionApp('oi-shared-relay', ...)

      const route = {
        Source: {
          HubConnStrSecretRef: sourceConn.ConnectionString,
          DeviceID: Source.DeviceID,
        },
        Subscribers: subscribers,
      };
      void route;

      // Persist routing registry so relay can reload
      // TODO(AI): KV.set(['SharedSimulator', EaC.EnterpriseLookup!, Lookup], route)

      // TODO(AI): call relay /admin/reload

      return;
    }) as unknown as SimulatorModuleBuilder<
      EaCSimulatorAsCode<EaCSharedSimulatorDetails>,
      void,
      void,
      { RoutesCount: number; LastSeenUTC?: string }
    >;
}

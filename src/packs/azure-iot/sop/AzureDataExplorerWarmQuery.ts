import { EaCWarmQueryAsCode, TokenCredential, z } from '../.deps.ts';
import { WarmQuery } from '../../../fluent/warm-queries/WarmQuery.ts';
import { loadKustoClient } from '../../../utils/loadKustoClient.ts';
import { AzureResolveCredentialStep } from '../steps/resolve-credential/AzureResolveCredentialStep.ts';
import { AzureResolveCredentialInput } from '../steps/resolve-credential/AzureResolveCredentialInput.ts';
import { WarmQueryModuleBuilder } from '../../../fluent/warm-queries/WarmQueryModuleBuilder.ts';
import { KustoResponseDataSet } from 'npm:azure-kusto-data@6.0.2';

export const AzureDataExplorerOutputSchema = z.any();

export type AzureDataExplorerOutput = KustoResponseDataSet;
//  z.infer<
//   typeof AzureDataExplorerOutputSchema
// >;

/**
 * Fluent WarmQuery module that executes an Azure Data Explorer query
 * using details embedded in the WarmQuery's AsCode metadata.
 */
export function AzureDataExplorerWarmQuery(
  lookup: string
): WarmQueryModuleBuilder<
  EaCWarmQueryAsCode,
  AzureDataExplorerOutput,
  void,
  void
> {
  return WarmQuery(lookup)
    // .OutputType(AzureDataExplorerOutputSchema)
    .Steps(() => ({
      ResolveCredential: AzureResolveCredentialStep.Build(),
    }))
    .Services(async (_ctx, { AsCode, Steps }) => {
      const { CredentialStrategy } = AsCode.Details ?? {};

      const { AccessToken } = await Steps.ResolveCredential(
        CredentialStrategy as AzureResolveCredentialInput
      );

      const Credential: TokenCredential = {
        getToken: async () => ({
          token: AccessToken,
          expiresOnTimestamp: Date.now() + 60 * 60 * 1000,
        }),
      };

      return { Credential };
    })
    .Run(async ({ AsCode, Services: { Credential } }) => {
      const query = AsCode.Details?.Query!;

      const cluster = 'fobd1-data-explorer'; // still hardcoded inline
      const region = 'westus2';
      const database = 'Telemetry';

      const kustoClient = await loadKustoClient(cluster, region, Credential);
      kustoClient.ensureOpen();

      const result = await kustoClient.execute(database, query);

      return result;
    }) as unknown as WarmQueryModuleBuilder<
    EaCWarmQueryAsCode,
    AzureDataExplorerOutput,
    void,
    void
  >;
}

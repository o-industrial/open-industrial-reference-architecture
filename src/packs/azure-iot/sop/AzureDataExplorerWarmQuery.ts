import { AccessToken, EaCWarmQueryAsCode, TokenCredential, z } from '../.deps.ts';
import { WarmQuery } from '../../../fluent/warm-queries/WarmQuery.ts';
import { loadKustoClient } from '../../../utils/loadKustoClient.ts';
import { AzureResolveCredentialStep } from '../steps/resolve-credential/AzureResolveCredentialStep.ts';
import { WarmQueryModuleBuilder } from '../../../fluent/warm-queries/WarmQueryModuleBuilder.ts';
import { KustoResponseDataSet } from 'npm:azure-kusto-data@6.0.2';

export const AzureDataExplorerOutputSchema: z.ZodAny = z.any();

export type AzureDataExplorerOutput = KustoResponseDataSet;
//  z.infer<
//   typeof AzureDataExplorerOutputSchema
// >;

/**
 * Fluent WarmQuery module that executes an Azure Data Explorer query
 * using details embedded in the WarmQuery's AsCode metadata.
 */
export function AzureDataExplorerWarmQuery(
  lookup: string,
): WarmQueryModuleBuilder<
  EaCWarmQueryAsCode,
  AzureDataExplorerOutput,
  void,
  void
> {
  const cluster = 'fobd1-data-explorer'; // still hardcoded inline
  const region = 'westus2';
  const database = 'Telemetry';

  return WarmQuery(lookup)
    .OutputType(AzureDataExplorerOutputSchema)
    .Steps(() => ({
      ResolveCredential: AzureResolveCredentialStep.Build(),
    }))
    .Services(async (ctx) => {
      const { AccessToken: initialToken } = await ctx.Steps.ResolveCredential({
        Method: 'kusto',
      });

      let cachedToken: string = initialToken;
      let tokenExpiry: number = Date.now() + 50 * 60 * 1000; // assume 50min expiry window

      const Credential: TokenCredential = {
        getToken: async (_scopes, _options): Promise<AccessToken> => {
          const now = Date.now();

          if (now >= tokenExpiry - 60_000) { // refresh if within 1 minute of expiry
            const { AccessToken: newToken } = await ctx.Steps.ResolveCredential({
              Method: 'kusto',
            });

            cachedToken = newToken;
            tokenExpiry = Date.now() + 50 * 60 * 1000;
          }

          return {
            token: cachedToken,
            expiresOnTimestamp: tokenExpiry,
          };
        },
      };

      return { Credential };
    })
    .Run(async ({ AsCode, Services: { Credential } }) => {
      const query = AsCode.Details?.Query!;

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

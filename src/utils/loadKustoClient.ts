import {
  Client as KustoClient,
  KustoConnectionStringBuilder,
} from 'npm:azure-kusto-data@6.0.2';

import { type TokenCredential } from 'npm:@azure/identity@4.7.0';

const kustoClientCache: Record<string, KustoClient> = {};

/**
 * Loads and caches a Kusto client for a given cluster and region.
 *
 * @param cluster - The cluster short name (e.g., "mycluster").
 * @param region - The Azure region (e.g., "westus").
 * @param credential - An instance of TokenCredential to authenticate with.
 * @returns A cached or newly created KustoClient.
 */
export async function loadKustoClient(
  cluster: string,
  region: string,
  credential: TokenCredential
): Promise<KustoClient> {
  const clusterUrl = `https://${cluster}.${region}.kusto.windows.net`;

  if (!(clusterUrl in kustoClientCache)) {
    const kcs = KustoConnectionStringBuilder.withTokenCredential(
      clusterUrl,
      credential
    );
    kustoClientCache[clusterUrl] = await new KustoClient(kcs);
  }

  return await kustoClientCache[clusterUrl];
}

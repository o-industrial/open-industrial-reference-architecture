import { AzureDataExplorerOutput } from '../../types/AzureDataExplorerOutput.ts';
import { EaCWarmQueryDetails } from '../.deps.ts';
import { ClientHelperBridge } from './ClientHelperBridge.ts';

/**
 * API for querying structured workspace data (e.g., RoomState, telemetry aggregates).
 *
 * Uses Azure Data Explorer (ADX) warm queries to support both:
 * - direct query execution via POST
 * - named query invocation via GET (lookup key)
 */
export class OpenIndustrialWorkspaceExplorerAPI {
  constructor(private bridge: ClientHelperBridge) {}

  /**
   * Execute a named warm query by lookup key.
   *
   * Requires the workspace to contain a valid WarmQuery definition under that key.
   *
   * @param queryLookup - The key name of the deployed warm query (e.g. 'RoomState.Averages')
   * @returns The structured query result from Azure Data Explorer.
   */
  public async RunNamedQuery(
    queryLookup: string,
  ): Promise<AzureDataExplorerOutput> {
    const trimmed = queryLookup.trim().replace(/^\/+/, '');
    const encodedPath = trimmed
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    const res = await fetch(
      this.bridge.url(`/api/workspaces/explorer/${encodedPath}`),
      {
        method: 'GET',
        headers: this.bridge.headers(),
      },
    );

    if (!res.ok) {
      throw new Error(
        `Explorer query '${queryLookup}' failed: ${res.status}`,
      );
    }

    return await this.bridge.json(res);
  }

  /**
   * Execute a one-off warm query inline, without storing it as part of workspace config.
   *
   * Useful for interactive filtering or debugging.
   *
   * @param details - The full warm query definition to run (KQL, parameters, surface binding, etc.)
   * @returns The structured query result from Azure Data Explorer.
   */
  public async RunAdHocQuery(
    details: EaCWarmQueryDetails,
  ): Promise<AzureDataExplorerOutput> {
    const res = await fetch(this.bridge.url('/api/workspaces/explorer/warm-queries'), {
      method: 'POST',
      headers: this.bridge.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(details),
    });

    if (!res.ok) {
      throw new Error(`Ad hoc explorer query failed: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

}

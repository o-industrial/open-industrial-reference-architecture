// src/api/clients/OpenIndustrialAdminAPI.ts
import { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import { ClientHelperBridge } from './ClientHelperBridge.ts';

/**
 * Administrative API subclient for OpenIndustrial.  Provides methods
 * for fetching enterprise and EaC listings.
 */
export class OpenIndustrialAdminAPI {
  constructor(private readonly bridge: ClientHelperBridge) {}

  /**
   * List top‑level workspaces.  An optional search query can be provided
   * to filter by enterprise name.
   *
   * @param query Optional name fragment used for filtering.
   */
  public async ListWorkspaces(query?: string): Promise<EverythingAsCodeOIWorkspace[]> {
    const url = new URL(this.bridge.url('/api/admin/enterprises'));
    if (query) {
      url.searchParams.set('q', query);
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: this.bridge.headers(),
    });
    if (!res.ok) {
      throw new Error(`Failed to list enterprises: ${res.status}`);
    }
    return await this.bridge.json(res);
  }
}

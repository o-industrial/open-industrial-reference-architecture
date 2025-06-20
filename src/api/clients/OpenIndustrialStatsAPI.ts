import { ClientHelperBridge } from './ClientHelperBridge.ts';

export class OpenIndustrialStatsAPI {
  constructor(private bridge: ClientHelperBridge) {}

  /**
   * Fetch runtime statistics for a given data connection.
   *
   * @param connLookup The lookup key of the connection.
   */
  public async GetStats<TStats>(
    type: string,
    connLookup: string,
  ): Promise<TStats> {
    const res = await fetch(
      this.bridge.url(`/api/stats/${type}/${connLookup}`),
      {
        method: 'GET',
        headers: this.bridge.headers(),
      },
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch stats for ${type} '${connLookup}': ${res.status}`,
      );
    }

    return await this.bridge.json<TStats>(res);
  }
}

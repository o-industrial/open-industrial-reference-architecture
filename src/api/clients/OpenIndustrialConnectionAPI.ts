import { CreateDataConnectionImpulse } from '../impulses/data-connections/CreateDataConnectionImpulse.ts';
import { ClientHelperBridge } from './ClientHelperBridge.ts';

/**
 * Subclient for declaring and managing OpenIndustrial data connections via impulses.
 */
export class OpenIndustrialConnectionAPI {
  constructor(private bridge: ClientHelperBridge) {}

  /**
   * Create a new data connection using the impulse system.
   */
  public async Create(
    req: CreateDataConnectionImpulse,
  ): Promise<{ Message: string }> {
    const res = await fetch(this.bridge.url('/api/data-connections'), {
      method: 'POST',
      headers: this.bridge.headers(),
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(`Failed to create data connection: ${res.status}`);
    }

    return await this.bridge.json(res);
  }
}

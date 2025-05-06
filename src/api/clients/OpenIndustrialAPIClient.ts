import { EaCBaseClient } from '../.deps.ts';
import { CreateDataConnectionImpulse } from '../impulses/data-connections/CreateDataConnectionImpulse.ts';

/**
 * A minimal, production-ready client for interacting with
 * OpenIndustrial’s execution APIs.
 *
 * Follows the bucketed structure pattern from EaC clients:
 * - Connections: Data connection declarations and routing
 * - (More buckets may include Schema, Agents, Surfaces, etc.)
 */
export class OpenIndustrialAPIClient extends EaCBaseClient {
  constructor(baseUrl: URL, apiToken: string) {
    super(baseUrl, apiToken);
  }

  /**
   * APIs related to data connection setup and routing into the system.
   */
  public Connections = {
    /**
     * Submit a new data connection declaration.
     *
     * This publishes a CreateDataConnection impulse via HTTP and expects
     * the execution substrate (e.g., NATS) to handle downstream processing.
     *
     * @param req - The request body containing Name and SourceType
     * @returns A success message or throws on failure
     */
    Create: async (
      req: CreateDataConnectionImpulse,
    ): Promise<{ Message: string }> => {
      const response = await fetch(
        this.loadClientUrl('/api/data-connections'),
        {
          method: 'POST',
          headers: this.loadHeaders(),
          body: JSON.stringify(req),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to create data connection: ${response.status}`);
      }

      return await this.json(response);
    },
  };
}

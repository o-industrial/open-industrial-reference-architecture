import { EaCBaseClient, EaCHistorySnapshot, EaCUserRecord, OpenIndustrialEaC } from '../.deps.ts';
import { CreateDataConnectionImpulse } from '../impulses/data-connections/CreateDataConnectionImpulse.ts';
import { EaCStatus } from 'jsr:@fathym/eac@0.2.106/steward/status';

/**
 * A minimal, production-ready client for interacting with
 * OpenIndustrial’s execution APIs.
 *
 * Follows the bucketed structure pattern from EaC clients:
 * - Workspaces: Lifecycle management of EaC instances
 * - Connections: Impulse-based surface ingestion
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
     * Publishes a `CreateDataConnectionImpulse` to the system.
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

  /**
   * APIs related to managing workspaces (EaC instances).
   */
  public Workspaces = {
    /**
     * Archive the currently scoped workspace for this JWT.
     */
    Archive: async (): Promise<OpenIndustrialEaC> => {
      const res = await fetch(this.loadClientUrl('/api/workspaces/archive'), {
        method: 'DELETE',
        headers: this.loadHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Failed to archive current workspace: ${res.status}`);
      }

      return await this.json(res);
    },

    /**
     * Commit a runtime memory snapshot to the current workspace.
     */
    Commit: async (historySnapshot: EaCHistorySnapshot): Promise<EaCStatus> => {
      const res = await fetch(this.loadClientUrl('/api/workspaces/commit'), {
        method: 'POST',
        headers: this.loadHeaders(),
        body: JSON.stringify(historySnapshot),
      });

      if (!res.ok) {
        throw new Error(`Failed to commit workspace snapshot: ${res.status}`);
      }

      return await this.json<EaCStatus>(res);
    },

    /**
     * Create a new Open Industrial workspace.
     */
    Create: async (
      eac: OpenIndustrialEaC,
    ): Promise<{ EnterpriseLookup: string; CommitID: string }> => {
      const res = await fetch(this.loadClientUrl('/api/workspaces'), {
        method: 'POST',
        headers: this.loadHeaders(),
        body: JSON.stringify(eac),
      });

      if (!res.ok) {
        throw new Error(`Failed to create workspace: ${res.status}`);
      }

      return await this.json(res);
    },

    /**
     * Get the currently scoped workspace for this JWT.
     */
    Get: async (): Promise<OpenIndustrialEaC> => {
      const res = await fetch(this.loadClientUrl('/api/workspaces'), {
        method: 'GET',
        headers: this.loadHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch current workspace: ${res.status}`);
      }

      return await this.json(res);
    },

    /**
     * List all Open Industrial workspaces available to the current user.
     */
    ListForUser: async (): Promise<EaCUserRecord[]> => {
      const res = await fetch(this.loadClientUrl('/api/workspaces/list'), {
        method: 'GET',
        headers: this.loadHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Failed to list workspaces: ${res.status}`);
      }

      return await this.json(res);
    },
  };
}

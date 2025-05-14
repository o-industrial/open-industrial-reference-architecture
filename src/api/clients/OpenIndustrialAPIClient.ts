import { EaCBaseClient } from '../.deps.ts';
import { OpenIndustrialConnectionAPI } from './OpenIndustrialConnectionAPI.ts';
import { OpenIndustrialWorkspaceAPI } from './OpenIndustrialWorkspaceAPI.ts';
import { OpenIndustrialProposalAPI } from './OpenIndustrialProposalAPI.ts';
import { ClientHelperBridge } from './ClientHelperBridge.ts';

/**
 * The main OpenIndustrial client for interacting with all runtime APIs.
 *
 * Provides access to structured subclients that encapsulate specific API categories.
 * Each subclient uses a common internal bridge for safely executing HTTP requests.
 */
export class OpenIndustrialAPIClient extends EaCBaseClient {
  /**
   * Subclient for managing lifecycle and memory operations for OpenIndustrial workspaces.
   *
   * Includes operations like:
   * - `Get` the current workspace
   * - `Create` a new one
   * - `ListForUser` accessible workspaces
   * - `Archive` or `Commit` changes
   */
  public readonly Workspaces: OpenIndustrialWorkspaceAPI;

  /**
   * Subclient for managing data connection impulses.
   *
   * Currently supports:
   * - `Create` connections via the impulse system
   */
  public readonly Connections: OpenIndustrialConnectionAPI;

  /**
   * Subclient for managing change proposals across the system.
   *
   * Includes functionality to:
   * - `Create`, `Get`, `Delete`, or `List` proposals
   * - `Consolidate` all pending proposals into a synthetic EaC overlay
   */
  public readonly Proposals: OpenIndustrialProposalAPI;

  /**
   * Constructs a new OpenIndustrialAPIClient and initializes all subclients.
   *
   * @param baseUrl - The root API URL for OpenIndustrial (e.g. https://api.openindustrial.dev)
   * @param apiToken - A valid bearer token for authentication
   */
  constructor(baseUrl: URL, apiToken: string) {
    super(baseUrl, apiToken);

    const bridge = this.createClientBridge();

    this.Workspaces = new OpenIndustrialWorkspaceAPI(bridge);
    this.Connections = new OpenIndustrialConnectionAPI(bridge);
    this.Proposals = new OpenIndustrialProposalAPI(bridge);
  }

  /**
   * Creates an internal bridge that safely exposes protected base client utilities
   * (e.g., `url`, `headers`, `json`) to the subclients without leaking full class access.
   */
  private createClientBridge(): ClientHelperBridge {
    return {
      url: (ref: string | URL) => this.loadClientUrl(ref),
      headers: (headers?: HeadersInit) => this.loadHeaders(headers),
      json: <T>(res: Response) => this.json<T>(res),
    };
  }
}

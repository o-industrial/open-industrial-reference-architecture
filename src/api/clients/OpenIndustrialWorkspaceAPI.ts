import { EaCStatus, EaCUserRecord } from '../.deps.ts';
import { EaCHistorySnapshot } from '../../types/EaCHistorySnapshot.ts';
import { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import { ClientHelperBridge } from './ClientHelperBridge.ts';

/**
 * Subclient for managing OpenIndustrial workspace lifecycle and memory commits.
 */

export class OpenIndustrialWorkspaceAPI {
  constructor(private bridge: ClientHelperBridge) {}

  /**
   * Archive the current workspace.
   */
  public async Archive(): Promise<EverythingAsCodeOIWorkspace> {
    const res = await fetch(this.bridge.url('/api/workspaces/archive'), {
      method: 'DELETE',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to archive current workspace: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * Commit a snapshot of runtime memory (e.g. agent execution history).
   */
  public async Commit(
    snapshot: EaCHistorySnapshot,
  ): Promise<EaCStatus> {
    const res = await fetch(this.bridge.url('/api/workspaces/commit'), {
      method: 'POST',
      headers: this.bridge.headers(),
      body: JSON.stringify(snapshot),
    });

    if (!res.ok) {
      throw new Error(`Failed to commit workspace snapshot: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * Create a new workspace from the given OpenIndustrial EaC configuration.
   */
  public async Create(
    eac: EverythingAsCodeOIWorkspace,
  ): Promise<{ EnterpriseLookup: string; CommitID: string }> {
    const res = await fetch(this.bridge.url('/api/workspaces'), {
      method: 'POST',
      headers: this.bridge.headers(),
      body: JSON.stringify(eac),
    });

    if (!res.ok) {
      throw new Error(`Failed to create workspace: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * Get the current workspace for the authenticated user.
   */
  public async Get(): Promise<EverythingAsCodeOIWorkspace> {
    const res = await fetch(this.bridge.url('/api/workspaces'), {
      method: 'GET',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch current workspace: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * List all workspaces available to the current user.
   */
  public async ListForUser(): Promise<EaCUserRecord[]> {
    const res = await fetch(this.bridge.url('/api/workspaces/list'), {
      method: 'GET',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to list workspaces: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * List all workspaces available to the current user.
   */
  public async LoadCapabilities(): Promise<Response> {
    const res = await fetch(this.bridge.url('/api/workspaces/capabilities'), {
      method: 'GET',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to load capabilities: ${res.status}`);
    }

    return res;
  }
}

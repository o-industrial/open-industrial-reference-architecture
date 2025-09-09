// src/api/clients/OpenIndustrialAdminAPI.ts
import { EverythingAsCode } from 'jsr:@fathym/eac@0.2.119';
import { EaCUserRecord } from '../.client.deps.ts';
import { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import { ClientHelperBridge } from './ClientHelperBridge.ts';
import { EaCStatus } from '../.client.deps.ts';
import { NullableArrayOrObject } from '../.deps.ts';

/**
 * Administrative API subclient for OpenIndustrial.  Provides methods
 * for fetching enterprise and EaC listings.
 */
export class OpenIndustrialAdminAPI {
  constructor(private readonly bridge: ClientHelperBridge) {}

  /**
   * Retrieve the current Everything-as-Code for the active workspace.
   * Uses the server-side steward to ensure the latest committed state.
   */
  public async GetEaC<T = EverythingAsCode>(): Promise<T> {
    const res = await fetch(this.bridge.url('/api/admin/eac'), {
      method: 'GET',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to get EaC: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * List top‑level workspaces.  An optional search query can be provided
   * to filter by enterprise name.
   *
   * @param query Optional name fragment used for filtering.
   */
  public async ListWorkspaces(
    query?: string,
  ): Promise<EverythingAsCodeOIWorkspace[]> {
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

  /**
   * List users across enterprises. Optional search query filters by username or enterprise name.
   *
   * @param query Optional fragment to filter results.
   */
  public async ListUsers(query?: string): Promise<EaCUserRecord[]> {
    const url = new URL(this.bridge.url('/api/admin/users'));
    if (query) {
      url.searchParams.set('q', query);
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to list users: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * Commit (create or update) a top-level EaC definition.
   *
   * @param eac - The Everything-as-Code payload to commit.
   * @returns The commit status and commit ID from the steward.
   */
  public async CommitEaC(
    eac: EverythingAsCode,
  ): Promise<{ status: EaCStatus; commitId: string }> {
    const res = await fetch(this.bridge.url('/api/admin/commit'), {
      method: 'POST',
      headers: this.bridge.headers(),
      body: JSON.stringify(eac),
    });

    if (!res.ok) {
      throw new Error(`Failed to commit EaC: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * Delete (archive) a top-level EaC definition.
   *
   * @param eac - A minimal EaC object identifying what to delete.
   * @returns The status of the delete operation.
   */
  public async DeleteEaC(
    eac: NullableArrayOrObject<EverythingAsCode>,
  ): Promise<{ status: EaCStatus }> {
    const res = await fetch(this.bridge.url('/api/admin/commit'), {
      method: 'DELETE',
      headers: this.bridge.headers(),
      body: JSON.stringify(eac),
    });

    if (!res.ok) {
      throw new Error(`Failed to delete EaC: ${res.status}`);
    }

    return await this.bridge.json(res);
  }
}

// src/api/clients/OpenIndustrialAdminAPI.ts
import { EverythingAsCode } from 'jsr:@fathym/eac@0.2.119';
import { EaCUserLicense, EaCUserRecord } from '../.client.deps.ts';
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
   * Invite a user to the parent (admin) scope by username (email).
   */
  public async InviteUser(username: string): Promise<unknown> {
    const res = await fetch(this.bridge.url('/api/admin/users/invite'), {
      method: 'POST',
      headers: this.bridge.headers(),
      body: JSON.stringify({ Username: username }),
    });

    if (!res.ok) {
      throw new Error(`Failed to invite admin user: ${res.status}`);
    }

    // Steward may return a status or message; pass it through
    return await this.bridge.json(res).catch(() => ({}));
  }

  // User Access Cards
  public async ListUserAccessCards(
    username: string,
  ): Promise<{ AccessConfigurationLookup: string; Username: string }[]> {
    const res = await fetch(
      this.bridge.url(`/api/admin/users/${encodeURIComponent(username)}/access-cards`),
      {
        method: 'GET',
        headers: this.bridge.headers(),
      },
    );
    if (!res.ok) {
      throw new Error(`Failed to list user access cards: ${res.status}`);
    }
    return await this.bridge.json(res);
  }

  public async AddUserAccessCard(
    username: string,
    accessConfigurationLookup: string,
  ): Promise<{ AccessConfigurationLookup: string; Username: string }[]> {
    const res = await fetch(
      this.bridge.url(`/api/admin/users/${encodeURIComponent(username)}/access-cards`),
      {
        method: 'POST',
        headers: this.bridge.headers(),
        body: JSON.stringify({ AccessConfigurationLookup: accessConfigurationLookup }),
      },
    );
    if (!res.ok) {
      throw new Error(`Failed to add user access card: ${res.status}`);
    }
    return await this.bridge.json(res);
  }

  public async RemoveUserAccessCard(
    username: string,
    accessConfigurationLookup: string,
  ): Promise<void> {
    const res = await fetch(
      this.bridge.url(
        `/api/admin/users/${encodeURIComponent(username)}/access-cards/${
          encodeURIComponent(accessConfigurationLookup)
        }`,
      ),
      {
        method: 'DELETE',
        headers: this.bridge.headers(),
      },
    );
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to remove user access card: ${res.status}`);
    }
  }

  // User Licenses
  public async ListUserLicenses(
    username: string,
  ): Promise<Record<string, EaCUserLicense>> {
    const res = await fetch(
      this.bridge.url(`/api/admin/users/${encodeURIComponent(username)}/licenses`),
      {
        method: 'GET',
        headers: this.bridge.headers(),
      },
    );
    if (!res.ok) {
      throw new Error(`Failed to list user licenses: ${res.status}`);
    }
    return await this.bridge.json(res);
  }

  public async CancelUserLicense(
    username: string,
    licLookup: string,
  ): Promise<void> {
    const res = await fetch(
      this.bridge.url(
        `/api/admin/users/${encodeURIComponent(username)}/licenses/${
          encodeURIComponent(licLookup)
        }`,
      ),
      {
        method: 'DELETE',
        headers: this.bridge.headers(),
      },
    );
    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to cancel user license: ${res.status}`);
    }
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
    debugger;
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

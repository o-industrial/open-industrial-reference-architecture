import { Proposal } from '../../types/Proposal.ts';
import { OpenIndustrialEaC } from '../../types/OpenIndustrialEaC.ts';
import { ClientHelperBridge } from './ClientHelperBridge.ts';
import { RecordKind } from '../../types/RecordKind.ts';

/**
 * Subclient for managing proposals within the OpenIndustrial system.
 *
 * Proposals are uniquely identified by `ID`, even when targeting the same Kind+Key.
 */
export class OpenIndustrialProposalAPI {
  constructor(private bridge: ClientHelperBridge) {}

  /**
   * Create a new proposal draft for a specific kind/key.
   */
  public async Create<T extends RecordKind>(
    proposal: Proposal<T>,
  ): Promise<{ id: string }> {
    const res = await fetch(this.bridge.url('/api/proposals'), {
      method: 'POST',
      headers: this.bridge.headers(),
      body: JSON.stringify(proposal),
    });

    if (!res.ok) {
      throw new Error(`Failed to create proposal: ${res.status}`);
    }

    return await this.bridge.json<{ id: string }>(res);
  }

  /**
   * Get a specific proposal by its unique ID.
   */
  public async GetByID<T extends RecordKind>(id: string): Promise<Proposal<T>> {
    const res = await fetch(this.bridge.url(`/api/proposals/${id}`), {
      method: 'GET',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to retrieve proposal ${id}: ${res.status}`);
    }

    return await this.bridge.json<Proposal<T>>(res);
  }

  /**
   * Delete (archive) a proposal by its unique ID.
   */
  public async Delete(id: string): Promise<void> {
    const res = await fetch(this.bridge.url(`/api/proposals/${id}`), {
      method: 'DELETE',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to delete proposal ${id}: ${res.status}`);
    }
  }

  /**
   * List all proposals for the current workspace.
   */
  public async List(): Promise<Proposal<RecordKind>[]> {
    const res = await fetch(this.bridge.url('/api/proposals/list'), {
      method: 'GET',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to list proposals: ${res.status}`);
    }

    return await this.bridge.json<Proposal<RecordKind>[]>(res);
  }

  /**
   * Optionally list all proposals that target a specific Kind+Key.
   * This supports filtering across competing proposals.
   */
  public async ListForTarget<T extends RecordKind>(
    kind: T,
    key: string,
  ): Promise<Proposal<T>[]> {
    const res = await fetch(
      this.bridge.url(`/api/proposals?kind=${kind}&key=${key}`),
      {
        method: 'GET',
        headers: this.bridge.headers(),
      },
    );

    if (!res.ok) {
      throw new Error(
        `Failed to list proposals for ${kind}/${key}: ${res.status}`,
      );
    }

    return await this.bridge.json<Proposal<T>[]>(res);
  }

  /**
   * Consolidate all active proposals into a synthetic OpenIndustrialEaC structure.
   */
  public async Consolidate(): Promise<OpenIndustrialEaC> {
    const res = await fetch(this.bridge.url('/api/proposals/consolidate'), {
      method: 'GET',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to consolidate proposals: ${res.status}`);
    }

    return await this.bridge.json<OpenIndustrialEaC>(res);
  }
}

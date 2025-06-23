import { OpenIndustrialAPIClient } from '../../../api/.exports.ts';
import { EverythingAsCodeOIWorkspace } from '../../../eac/EverythingAsCodeOIWorkspace.ts';
import { Proposal } from '../../../types/Proposal.ts';
import { RecordKind } from '../../../types/RecordKind.ts';
import { EaCManager } from '../EaCManager.ts';

/**
 * Manages the lifecycle of uncommitted EaC proposals.
 *
 * Proposals are speculative, user- or agent-generated changes to a specific
 * key within the Everything-as-Code graph. This manager supports:
 * - fetching proposals
 * - filtering by kind/key
 * - accepting (merging) proposals into the live EaC
 * - rejecting or forking proposals for revision
 */
export class EaCProposalManager {
  protected proposals: Proposal<RecordKind>[] = [];
  protected listeners: Set<() => void> = new Set<() => void>();

  constructor(
    protected oiSvc: OpenIndustrialAPIClient,
    protected eacManager: EaCManager,
  ) {}

  /**
   * Load all proposals from the API and update local state.
   */
  public async Load(): Promise<void> {
    this.proposals = await this.oiSvc.Proposals.List();
    this.emit();
  }

  /**
   * Return all known proposals (regardless of status).
   */
  public GetAll(): Proposal<RecordKind>[] {
    return [...this.proposals];
  }

  /**
   * Return only proposals currently marked as 'pending'.
   */
  public GetPending(): Proposal<RecordKind>[] {
    return this.proposals.filter((p) => p.Status === 'pending');
  }

  /**
   * Lookup a proposal by its unique `ID`.
   */
  public GetByID(id: string): Proposal<RecordKind> | undefined {
    return this.proposals.find((p) => p.ID === id);
  }

  /**
   * Retrieve all proposals targeting the same Kind and Key.
   */
  public GetForTarget<T extends RecordKind>(
    kind: T,
    key: string,
  ): Proposal<T>[] {
    return this.proposals.filter(
      (p) => p.Kind === kind && p.Key === key,
    ) as Proposal<T>[];
  }

  /**
   * Accept a proposal and merge it into the live EaC system.
   * This does not persist status remotely (optional).
   */
  public Accept(id: string): Promise<void> {
    const proposal = this.GetByID(id);
    if (!proposal) throw new Error(`Proposal not found: ${id}`);

    const partial = {
      [proposal.Kind]: {
        [proposal.Key]: proposal.Proposed,
      },
    };

    this.eacManager.MergePartial(partial as EverythingAsCodeOIWorkspace);

    proposal.Status = 'accepted';
    this.emit();

    // Optionally:
    // await this.api.Proposals.UpdateStatus(id, 'accepted');

    return Promise.resolve();
  }

  /**
   * Mark a proposal as rejected locally and emit change.
   * Does not persist status remotely (optional).
   */
  public Reject(id: string): Promise<void> {
    const proposal = this.GetByID(id);
    if (!proposal) {
      return Promise.resolve();
    }

    proposal.Status = 'rejected';
    this.emit();

    // Optionally:
    // await this.api.Proposals.UpdateStatus(id, 'rejected');

    return Promise.resolve();
  }

  /**
   * Fork a proposal into a new draft with a new ID.
   */
  public async Fork<T extends RecordKind>(
    id: string,
    delta: Partial<Proposal<T>>,
  ): Promise<string> {
    const proposal = this.GetByID(id) as Proposal<T>;
    if (!proposal) throw new Error(`Proposal not found: ${id}`);

    const forked: Proposal<T> = {
      ...proposal,
      ...delta,
      ID: crypto.randomUUID(),
      Status: 'pending',
    };

    const { id: newId } = await this.oiSvc.Proposals.Create(forked);
    await this.Load();

    return newId;
  }

  /**
   * Subscribe to proposal state changes.
   */
  public OnChange(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  /**
   * Notify listeners of proposal updates.
   */
  protected emit(): void {
    for (const cb of this.listeners) cb();
  }
}

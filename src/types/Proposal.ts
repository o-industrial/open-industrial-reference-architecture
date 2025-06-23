import { EaCFlowNodeMetadata } from '../eac/EaCFlowNodeMetadata.ts';
import { EverythingAsCodeOIWorkspace } from '../eac/EverythingAsCodeOIWorkspace.ts';
import { RecordKind } from './RecordKind.ts';

/**
 * Proposal for mutating a key/value entry in the EverythingAsCodeOIWorkspace.
 * T is constrained to kinds that are record maps.
 */
export type Proposal<T extends RecordKind> = {
  ID: string;

  Kind: T;

  /** The key within the record (e.g., "RoomState", "FanControlAgent") */
  Key: string;

  /** Partial proposed value for that key — based on the record type under Kind */
  Proposed: EverythingAsCodeOIWorkspace[T] extends Record<string, infer U> ? Partial<U>
    : never;

  /** Optional visual or origin metadata */
  Metadata?: EaCFlowNodeMetadata;

  /** Human or agent-authored explanation */
  Reason?: string;

  /** Proposal lifecycle status */
  Status?: 'pending' | 'accepted' | 'rejected';
};

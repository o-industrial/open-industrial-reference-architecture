import { EaCFlowNodeMetadata, EaCVertexDetails } from '../../.deps.ts';

/**
 * Represents a single node in the flow graph canvas.
 *
 * This is a generic wrapper for any EaC component type (e.g. connection, simulator, surface),
 * along with display metadata like label and layout metadata like position/enablement.
 */
export type FlowGraphNode<TEaC extends EaCVertexDetails = EaCVertexDetails> = {
  /** Unique internal ID for referencing this node in the flow graph. */
  ID: string;

  /** Canonical flow node type — determines rendering and behavior. */
  Type: string;

  /** Optional label used for node UI (fallbacks to Name or ID). */
  Label?: string;

  /** Runtime metadata for layout position and enablement state. */
  Metadata?: EaCFlowNodeMetadata;

  /** Optional embedded EaC details object (e.g. simulator, surface, connection). */
  Details?: TEaC;
};

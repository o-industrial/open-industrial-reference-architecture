import { EaCFlowNodeMetadata, EaCVertexDetails } from '../../.deps.ts';

/**
 * Patch input used when building a node update.
 */
export type EaCNodeCapabilityPatch<
  TDetails extends EaCVertexDetails = EaCVertexDetails,
> = {
  Details?: TDetails;
  Metadata?: EaCFlowNodeMetadata;
};

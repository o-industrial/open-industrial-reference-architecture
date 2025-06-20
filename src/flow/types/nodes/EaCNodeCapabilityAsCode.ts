import { EaCFlowNodeMetadata } from '../../../eac/EaCFlowNodeMetadata.ts';
import { EaCVertexDetails } from '../../.deps.ts';

/**
 * Return structure for a GetAsCode call.
 */
export type EaCNodeCapabilityAsCode<
  TDetails extends EaCVertexDetails = EaCVertexDetails,
> = {
  Details: TDetails;
  Metadata?: EaCFlowNodeMetadata;
};

import { EaCAgentDetails } from '../../../../eac/EaCAgentDetails.ts';
import { FlowNodeData } from '../../../../flow/types/react/FlowNodeData.ts';
import { SurfaceAgentStats } from './SurfaceAgentStats.tsx';

export type SurfaceAgentNodeData = FlowNodeData<
  EaCAgentDetails,
  SurfaceAgentStats
>;

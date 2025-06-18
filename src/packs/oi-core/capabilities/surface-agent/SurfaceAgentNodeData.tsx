import { EaCAgentDetails } from '../../../../eac/EaCAgentDetails.ts';
import { FlowNodeData } from '../../.deps.ts';
import { SurfaceAgentStats } from './SurfaceAgentStats.tsx';

export type SurfaceAgentNodeData = FlowNodeData<EaCAgentDetails, SurfaceAgentStats>;

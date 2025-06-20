import { EaCSimulatorDetails } from '../../../../eac/EaCSimulatorDetails.ts';
import { FlowNodeData } from '../../../../flow/types/react/FlowNodeData.ts';
import { SimulatorStats } from './SimulatorStats.tsx';

export type SimulatorNodeData = FlowNodeData<
  EaCSimulatorDetails,
  SimulatorStats
>;

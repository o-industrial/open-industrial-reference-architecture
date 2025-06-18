import { EaCSimulatorDetails } from '../../../../eac/EaCSimulatorDetails.ts';
import { FlowNodeData } from '../../.deps.ts';
import { SimulatorStats } from './SimulatorStats.tsx';

export type SimulatorNodeData = FlowNodeData<
  EaCSimulatorDetails,
  SimulatorStats
>;

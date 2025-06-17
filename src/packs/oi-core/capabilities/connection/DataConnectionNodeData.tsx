import { EaCDataConnectionDetails, FlowNodeData } from '../../.deps.ts';
import { DataConnectionStats } from './DataConnectionStats.ts';

export type DataConnectionNodeData = FlowNodeData<
  EaCDataConnectionDetails,
  DataConnectionStats
>;

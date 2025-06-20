import { DataConnectionStats, EaCDataConnectionDetails, FlowNodeData } from '../../.deps.ts';

export type DataConnectionNodeData = FlowNodeData<
  EaCDataConnectionDetails,
  DataConnectionStats
>;

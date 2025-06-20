import { EaCDataConnectionDetails } from '../../../../eac/EaCDataConnectionDetails.ts';
import { FlowNodeData } from '../../../../flow/.exports.ts';
import { DataConnectionStats } from './DataConnectionStats.ts';

export type DataConnectionNodeData = FlowNodeData<
  EaCDataConnectionDetails,
  DataConnectionStats
>;

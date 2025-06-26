import { FlowNodeData } from '../../../../flow/.exports.ts';
import { SurfaceWarmQueryStats } from './SurfaceWarmQueryStats.tsx';
import { SurfaceWarmQuerySettings } from '../../../../eac/.exports.ts';

export type SurfaceWarmQueryNodeData = FlowNodeData<
  SurfaceWarmQuerySettings,
  SurfaceWarmQueryStats
>;

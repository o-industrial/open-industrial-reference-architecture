import { FlowNodeData } from '../../.deps.ts';
import { SurfaceWarmQueryStats } from './SurfaceWarmQueryStats.tsx';
import { SurfaceWarmQuerySettings } from '../../../../eac/.deps.ts';

export type SurfaceWarmQueryNodeData = FlowNodeData<
  SurfaceWarmQuerySettings,
  SurfaceWarmQueryStats
>;

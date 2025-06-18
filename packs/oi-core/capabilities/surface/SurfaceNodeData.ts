import { EaCSurfaceDetails, FlowNodeData } from '../../.deps.ts';
import { SurfaceNodeEvent } from './SurfaceNodeEvent.ts';
import { SurfaceStats } from './SurfaceStats.ts';

export type SurfaceNodeData = FlowNodeData<
  EaCSurfaceDetails,
  SurfaceStats,
  SurfaceNodeEvent
>;

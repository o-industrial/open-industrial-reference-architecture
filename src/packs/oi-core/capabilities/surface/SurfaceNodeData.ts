import { SurfaceNodeEvent } from './SurfaceNodeEvent.ts';
import { SurfaceStats } from './SurfaceStats.ts';
import { FlowNodeData } from '../../.deps.ts';
import { EaCSurfaceDetails } from '../../../../eac/EaCSurfaceDetails.ts';

export type SurfaceNodeData = FlowNodeData<
  EaCSurfaceDetails,
  SurfaceStats,
  SurfaceNodeEvent
>;

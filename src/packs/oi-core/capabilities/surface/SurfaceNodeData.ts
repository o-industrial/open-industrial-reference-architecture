import { SurfaceNodeEvent } from './SurfaceNodeEvent.ts';
import { SurfaceStats } from './SurfaceStats.ts';
import { EaCSurfaceDetails } from '../../../../eac/EaCSurfaceDetails.ts';
import { FlowNodeData } from '../../../../flow/types/react/FlowNodeData.ts';

export type SurfaceNodeData = FlowNodeData<
  EaCSurfaceDetails,
  SurfaceStats,
  SurfaceNodeEvent
>;

import { SurfaceDataConnectionSettings } from '../../../../eac/EaCSurfaceAsCode.ts';
import { FlowNodeData } from '../../../../flow/.exports.ts';
import { SurfaceConnectionStats } from './SurfaceConnectionStats.tsx';

export type SurfaceConnectionNodeData = FlowNodeData<
  SurfaceDataConnectionSettings,
  SurfaceConnectionStats
>;

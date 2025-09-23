import { FlowNodeData } from '../../../../flow/.exports.ts';
import { EaCInterfaceDetails, SurfaceInterfaceSettings } from '../../../../eac/.exports.ts';
import { SurfaceInterfaceStats } from './SurfaceInterfaceStats.tsx';

export type SurfaceInterfaceNodeDetails =
  & EaCInterfaceDetails
  & SurfaceInterfaceSettings
  & {
    SurfaceLookup?: string;
  };

export type SurfaceInterfaceNodeData = FlowNodeData<
  SurfaceInterfaceNodeDetails,
  SurfaceInterfaceStats
>;

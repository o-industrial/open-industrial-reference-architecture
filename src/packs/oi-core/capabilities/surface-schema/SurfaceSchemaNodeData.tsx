import { EaCSchemaDetails } from '../../../../eac/EaCSchemaDetails.ts';
import { FlowNodeData } from '../../../../flow/types/react/FlowNodeData.ts';
import { SurfaceSchemaStats } from './SurfaceSchemaStats.tsx';

export type SurfaceSchemaNodeData = FlowNodeData<EaCSchemaDetails, SurfaceSchemaStats>;

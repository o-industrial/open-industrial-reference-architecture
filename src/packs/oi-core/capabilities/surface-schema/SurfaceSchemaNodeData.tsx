import { EaCSchemaDetails } from '../../../../eac/EaCSchemaDetails.ts';
import { FlowNodeData } from '../../.deps.ts';
import { SurfaceSchemaStats } from './SurfaceSchemaStats.tsx';

export type SurfaceSchemaNodeData = FlowNodeData<EaCSchemaDetails, SurfaceSchemaStats>;

import { Pack } from '../../src/fluent/packs/Pack.ts';
import { PackModuleBuilder } from '../../src/fluent/packs/PackModuleBuilder.ts';
import { DataConnectionNodeCapabilityManager } from './capabilities/connection/DataConnectionNodeCapabilityManager.ts';
import { SimulatorNodeCapabilityManager } from './capabilities/simulator/SimulatorNodeCapabilityManager.ts';
import { SurfaceAgentNodeCapabilityManager } from './capabilities/surface-agent/SurfaceAgentNodeCapabilityManager.ts';
import { SurfaceConnectionNodeCapabilityManager } from './capabilities/surface-connection/SurfaceConnectionNodeCapabilityManager.ts';
import { SurfaceSchemaNodeCapabilityManager } from './capabilities/surface-schema/SurfaceSchemaNodeCapabilityManager.ts';
import { SurfaceNodeCapabilityManager } from './capabilities/surface/SurfaceNodeCapabilityManager.ts';

export default Pack().Capabilities({
  surface: [
    new SurfaceSchemaNodeCapabilityManager(),
    new SurfaceAgentNodeCapabilityManager(),
    new SurfaceConnectionNodeCapabilityManager(),
  ],
  workspace: [
    new DataConnectionNodeCapabilityManager(),
    new SurfaceNodeCapabilityManager(),
    new SimulatorNodeCapabilityManager(),
  ],
}) as PackModuleBuilder;

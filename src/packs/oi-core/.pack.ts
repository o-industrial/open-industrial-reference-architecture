import { Pack } from '../../fluent/packs/Pack.ts';
import { PackModuleBuilder } from '../../fluent/packs/PackModuleBuilder.ts';
import { OpenIndustrialAPIClient } from '../../api/.exports.ts';
import { DataConnectionNodeCapabilityManager } from './capabilities/connection/DataConnectionNodeCapabilityManager.ts';
import { SimulatorNodeCapabilityManager } from './capabilities/simulator/SimulatorNodeCapabilityManager.ts';
import { SurfaceAgentNodeCapabilityManager } from './capabilities/surface-agent/SurfaceAgentNodeCapabilityManager.ts';
import { SurfaceConnectionNodeCapabilityManager } from './capabilities/surface-connection/SurfaceConnectionNodeCapabilityManager.ts';
// import { SurfaceSchemaNodeCapabilityManager } from './capabilities/surface-schema/SurfaceSchemaNodeCapabilityManager.ts';
import { SurfaceNodeCapabilityManager } from './capabilities/surface/SurfaceNodeCapabilityManager.ts';
import { SurfaceWarmQueryNodeCapabilityManager } from './capabilities/surface-warmquery/SurfaceWarmQueryNodeCapabilityManager.tsx';

export default Pack().Capabilities(async (ioc) => {
  const oiSvc = await ioc.Resolve(OpenIndustrialAPIClient);

  return {
    surface: [
      // new SurfaceSchemaNodeCapabilityManager(oiSvc),
      new SurfaceAgentNodeCapabilityManager(oiSvc),
      new SurfaceConnectionNodeCapabilityManager(oiSvc),
      new SurfaceWarmQueryNodeCapabilityManager(oiSvc),
    ],
    workspace: [
      new SimulatorNodeCapabilityManager(oiSvc),
      new DataConnectionNodeCapabilityManager(oiSvc),
      new SurfaceNodeCapabilityManager(oiSvc),
    ],
  };
}) as PackModuleBuilder;

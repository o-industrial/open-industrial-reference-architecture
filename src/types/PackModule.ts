import { EaCNodeCapabilityManager } from '../flow/managers/eac/EaCNodeCapabilityManager.ts';
import { NodeScopeTypes } from '../flow/types/graph/NodeScopeTypes.ts';
import { StepModule } from '../fluent/steps/StepModule.ts';

export type PackModule = {
  Capabilities?: Record<NodeScopeTypes, EaCNodeCapabilityManager[]>;

  Steps: Record<string, StepModule>;
};

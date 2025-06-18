import { EaCNodeCapabilityManager } from '../flow/managers/eac/EaCNodeCapabilityManager.ts';
import { StepModule } from '../fluent/steps/StepModule.ts';

export type PackModule = {
  Capabilities?: {
    Surface?: EaCNodeCapabilityManager[];

    Workspace?: EaCNodeCapabilityManager[];
  };

  Steps: Record<string, StepModule>;
};

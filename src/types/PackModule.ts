import { EaCNodeCapabilityManager } from '../flow/managers/eac/EaCNodeCapabilityManager.ts';
import { StepModule } from '../fluent/steps/StepModule.ts';

export type PackModule = {
  Capabilities?: {
    surface?: EaCNodeCapabilityManager[];

    workspace?: EaCNodeCapabilityManager[];
  };

  Steps: Record<string, StepModule>;
};

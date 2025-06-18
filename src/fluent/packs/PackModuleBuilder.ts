// deno-lint-ignore-file no-explicit-any
import { PackModule } from '../../types/PackModule.ts';
import { StepModule } from '../steps/StepModule.ts';

/**
 * Fluent builder for defining a PackModule.
 * Supports chaining `Capabilities()` and `Steps()` for structured authoring.
 */
export class PackModuleBuilder {
  protected capabilities: PackModule['Capabilities'] = {};
  protected steps: Record<string, StepModule> = {};

  /**
   * Define capability managers scoped to the workspace or surface.
   */
  public Capabilities(caps: Partial<PackModule['Capabilities']>): this {
    this.capabilities = {
      ...this.capabilities,
      ...caps,
    };
    return this;
  }

  /**
   * Define the executable step modules included in this pack.
   */
  public Steps(steps: Record<string, StepModule<any, any, any, any, any, any>>): this {
    this.steps = steps;
    return this;
  }

  /**
   * Finalize and return the PackModule object.
   */
  public Build(): PackModule {
    return {
      ...(Object.keys(this.capabilities || {}).length ? { Capabilities: this.capabilities } : {}),
      Steps: this.steps,
    };
  }
}

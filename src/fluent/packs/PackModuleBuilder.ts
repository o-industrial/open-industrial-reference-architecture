import type { IoCContainer } from './.deps.ts';
import type { PackModule } from '../../types/PackModule.ts';
import type { StepModule } from '../steps/StepModule.ts';
import type { MaybeAsync } from '../types/MaybeAsync.ts';

type CapabilitiesResolver = (
  ioc: IoCContainer,
) => MaybeAsync<PackModule['Capabilities']>;
type StepsResolver = (
  ioc: IoCContainer,
) => MaybeAsync<Record<string, StepModule>>;

export class PackModuleBuilder {
  private capabilitiesResolver?: CapabilitiesResolver;
  private stepsResolver?: StepsResolver;

  /**
   * Define capability managers using an IoC-aware resolver function.
   */
  public Capabilities(resolver: CapabilitiesResolver): this {
    this.capabilitiesResolver = resolver;
    return this;
  }

  /**
   * Define step modules using an IoC-aware resolver function.
   */
  public Steps(resolver: StepsResolver): this {
    this.stepsResolver = resolver;
    return this;
  }

  /**
   * Finalize and return the PackModule with injected dependencies.
   */
  public async Build(ioc: IoCContainer): Promise<PackModule> {
    const capabilities = this.capabilitiesResolver
      ? await this.capabilitiesResolver(ioc)
      : { surface: [], workspace: [] };

    const steps = this.stepsResolver ? await this.stepsResolver(ioc) : {};

    return {
      Capabilities: capabilities,
      Steps: steps,
    };
  }
}

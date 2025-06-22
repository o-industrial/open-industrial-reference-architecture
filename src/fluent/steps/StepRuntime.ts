import type { StepContext } from '../types/StepContext.ts';
import type { StepInvokerMap } from './StepInvokerMap.ts';
import type { StepModuleMetadata } from './StepModuleMetadata.ts';

/**
 * Abstract base class for all runtime Steps.
 * Used by both fluent-built and authored StepModules.
 *
 * @template TInput     Input payload schema type
 * @template TOutput    Output result schema type
 * @template TOptions   Optional runtime execution options
 * @template TServices  Optional injected services (e.g., SDKs, caches)
 * @template TSubSteps  Optional invokable substeps map
 */
export abstract class StepRuntime<
  TInput = unknown,
  TOutput = unknown,
  TOptions = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSubSteps extends StepInvokerMap = StepInvokerMap,
> {
  protected readonly options: TOptions;

  constructor(options: TOptions) {
    this.options = options;
  }

  /**
   * Returns developer-facing metadata for this step.
   */
  public abstract BuildMetadata(): StepModuleMetadata;

  /**
   * Optional setup hook before Execute().
   */
  public Init?(
    input: TInput,
    ctx: StepContext<TOptions, TServices, TSubSteps>,
  ): void | Promise<void>;

  /**
   * The primary execution logic for this step.
   * Input is passed separately, not embedded in the context.
   */
  public abstract Execute(
    input: TInput,
    ctx: StepContext<TOptions, TServices, TSubSteps>,
  ): Promise<TOutput>;

  /**
   * Optional cleanup hook after execution.
   */
  public Cleanup?(
    input: TInput,
    ctx: StepContext<TOptions, TServices, TSubSteps>,
  ): void | Promise<void>;

  /**
   * Optional hook to inject service dependencies at runtime.
   */
  protected injectServices?(
    input: TInput,
    ctx: StepContext<TOptions, TServices, TSubSteps>,
  ): Promise<Partial<TServices>>;

  /**
   * Optional hook to inject callable substeps into the context.
   */
  protected injectSubSteps?(
    input: TInput,
    ctx: StepContext<TOptions, TServices, TSubSteps>,
  ): Promise<TSubSteps>;

  /**
   * Prepares and enriches the context with any services, substeps, and options needed by this step.
   */
  public async ConfigureContext(
    input: TInput,
    ctx: Partial<StepContext<TOptions, TServices, TSubSteps>>,
  ): Promise<StepContext<TOptions, TServices, TSubSteps>> {
    // Inject Options if available
    if (this.options) {
      ctx.Options = this.options;
    }

    // Inject substeps
    if (typeof this.injectSubSteps === 'function') {
      const subSteps = await this.injectSubSteps(
        input,
        ctx as StepContext<TOptions, TServices, TSubSteps>,
      );
      ctx.Steps = {
        ...(ctx.Steps ?? {}),
        ...subSteps,
      } as TSubSteps;
    }

    // Inject services
    if (typeof this.injectServices === 'function') {
      const services = await this.injectServices(
        input,
        ctx as StepContext<TOptions, TServices, TSubSteps>,
      );
      ctx.Services = {
        ...(ctx.Services ?? {}),
        ...services,
      } as TServices;
    }

    return ctx as StepContext<TOptions, TServices, TSubSteps>;
  }
}

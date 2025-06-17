// deno-lint-ignore-file no-explicit-any
import type { IoCContainer } from './.deps.ts';
import type { EaCDetails, EaCVertexDetails } from '../types/.deps.ts';
import type { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import type { VerificationInvokerMap } from '../types/VerificationInvokerMap.ts';
import type { FluentContext } from '../types/FluentContext.ts';

/**
 * Base class for any fluent-configured runtime, driven by `.AsCode` + enriched context.
 *
 * @template TAsCode   Typed Everything-as-Code configuration
 * @template TOutput   Final result of `.Execute()`
 * @template TServices Service bindings injected during runtime setup
 * @template TSteps    Callable substep map for chaining
 * @template TContext  Enriched context type (default: FluentContext)
 */
export abstract class FluentRuntime<
  TAsCode extends EaCDetails<EaCVertexDetails>,
  TOutput = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
  TContext extends FluentContext<TAsCode, TServices, TSteps> = FluentContext<
    TAsCode,
    TServices,
    TSteps
  >,
> {
  /**
   * Optional setup hook before main execution.
   */
  public Init?(ctx: TContext): void | Promise<void>;

  /**
   * User-defined main execution logic — must be implemented by subclasses.
   */
  protected abstract run(ctx: TContext): Promise<TOutput>;

  /**
   * Entrypoint method. Validates verifications (if any) before calling `run()`.
   */
  public async Execute(ctx: TContext): Promise<TOutput> {
    return await this.runWithVerifications(ctx);
  }

  /**
   * Optional cleanup hook after execution completes.
   */
  public Cleanup?(ctx: TContext): void | Promise<void>;

  /**
   * Optionally injects services into context.
   */
  protected injectServices?(
    ctx: TContext,
    ioc: IoCContainer,
  ): Promise<Partial<TServices>>;

  /**
   * Optionally injects step invokers into context.
   */
  protected injectSteps?(ctx: TContext): Promise<TSteps>;

  /**
   * Optionally injects verification checks.
   */
  protected injectVerifications?(
    ctx: TContext,
  ): Promise<VerificationInvokerMap<TContext>>;

  /**
   * Internal execution wrapper with optional verification check stage.
   */
  protected async runWithVerifications(ctx: TContext): Promise<TOutput> {
    const verifications = await this.injectVerifications?.(ctx);

    if (verifications) {
      const failures: Record<string, string> = {};

      for (const [name, fn] of Object.entries(verifications)) {
        const result = await fn(ctx);
        if (result) failures[name] = result;
      }

      if (Object.keys(failures).length > 0) {
        const err = new Error('FluentModule verification failed.');
        (err as any).verifications = failures;
        throw err;
      }
    }

    return await this.run(ctx);
  }

  /**
   * Builds the full runtime context with injected services and substeps.
   */
  public async ConfigureContext(
    base: Partial<TContext>,
    ioc?: IoCContainer,
  ): Promise<TContext> {
    const ctx = { ...base } as TContext;

    if (typeof this.injectServices === 'function') {
      const services = await this.injectServices(ctx, ioc!);
      ctx.Services = { ...(ctx.Services ?? {}), ...services } as TServices;
    }

    if (typeof this.injectSteps === 'function') {
      ctx.Steps = await this.injectSteps(ctx);
    }

    return ctx;
  }
}

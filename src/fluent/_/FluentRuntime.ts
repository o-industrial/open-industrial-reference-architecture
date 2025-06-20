// deno-lint-ignore-file no-explicit-any
import type { IoCContainer } from './.deps.ts';
import type { EaCDetails, EaCVertexDetails } from '../types/.deps.ts';
import type { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import type { VerificationInvokerMap } from '../types/VerificationInvokerMap.ts';
import type { FluentContext } from '../types/FluentContext.ts';
import type { Status } from 'jsr:@fathym/common@0.2.264';

/**
 * Base class for any fluent-configured runtime, driven by `.AsCode` + enriched context.
 *
 * @template TAsCode   Typed Everything-as-Code configuration
 * @template TOutput   Output type for .Run()
 * @template TDeploy   Output type for .Deploy()
 * @template TStats    Output type for .Stats()
 * @template TServices Services injected at runtime
 * @template TSteps    Available step invokers
 * @template TContext  Full execution context
 */
export abstract class FluentRuntime<
  TAsCode extends EaCDetails<EaCVertexDetails>,
  TOutput = unknown,
  TDeploy = Status,
  TStats = unknown,
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
   * Optional cleanup hook after execution completes.
   */
  public Cleanup?(ctx: TContext): void | Promise<void>;

  /**
   * User-defined Run logic. Required.
   */
  protected abstract run(ctx: TContext): Promise<TOutput>;

  /**
   * Optional Deploy logic. Must be set to use .Deploy().
   */
  protected deploy?(ctx: TContext): Promise<TDeploy>;

  /**
   * Optional Stats logic. Must be set to use .Stats().
   */
  protected stats?(ctx: TContext): Promise<TStats>;

  /**
   * Entrypoint for standard execution.
   */
  public async Run(ctx: TContext): Promise<TOutput> {
    return await this.executeWithVerifications(ctx, this.run.bind(this));
  }

  /**
   * Entrypoint for deployment behavior.
   */
  public async Deploy(ctx: TContext): Promise<TDeploy> {
    if (!this.deploy) throw new Error('Deploy() not implemented.');
    return await this.executeWithVerifications(ctx, this.deploy.bind(this));
  }

  /**
   * Entrypoint for stats query behavior.
   */
  public async Stats(ctx: TContext): Promise<TStats> {
    if (!this.stats) throw new Error('Stats() not implemented.');
    return await this.executeWithVerifications(ctx, this.stats.bind(this));
  }

  /**
   * Shared execution logic across Run, Deploy, Stats with optional verifications.
   */
  protected async executeWithVerifications<TResult>(
    ctx: TContext,
    execute: (ctx: TContext) => Promise<TResult>,
  ): Promise<TResult> {
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

    return await execute(ctx);
  }

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

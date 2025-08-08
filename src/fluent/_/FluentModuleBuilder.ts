// deno-lint-ignore-file no-explicit-any ban-types
import type { Status, ZodType } from './.deps.ts';
import type { StepModule } from '../steps/StepModule.ts';
import type { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import type { VerificationInvokerMap } from '../types/VerificationInvokerMap.ts';
import type { EaCDetails, EaCVertexDetails } from '../types/.deps.ts';

import { FluentRuntime } from './FluentRuntime.ts';
import type { FluentContext } from '../types/FluentContext.ts';
import type { MaybeAsync } from '../types/MaybeAsync.ts';
import { UsedKeys } from '../types/UsedKeys.ts';
import { RemoveUsed } from '../types/RemoveUsed.ts';

export abstract class FluentModuleBuilder<
  TAsCode extends EaCDetails<EaCVertexDetails>,
  TContext extends FluentContext<TAsCode, TServices, TSteps>,
  TRuntime extends FluentRuntime<
    TAsCode,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps,
    TContext
  >,
  TModule,
  TOutput = unknown,
  TDeploy = Status,
  TStats = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
  TUsed extends UsedKeys = {},
> {
  protected deploySchema?: ZodType<TDeploy>;
  protected outputSchema?: ZodType<TOutput>;
  protected statsSchema?: ZodType<TStats>;

  protected serviceInjectedFirst: boolean = false;
  protected stepsInjectedFirst: boolean = false;

  protected servicesFactory?: (
    ctx: TContext,
    ioc: any,
  ) => MaybeAsync<TServices>;

  protected stepFactory?: (
    ctx: TContext,
  ) =>
    | Promise<Record<string, StepModule<any, any, any, any, any>>>
    | Record<string, StepModule<any, any, any, any, any>>;

  protected verificationFactory?: (
    ctx: TContext,
  ) => MaybeAsync<VerificationInvokerMap<TContext>>;

  protected runFn?: (ctx: TContext) => Promise<TOutput>;
  protected deployFn?: (ctx: TContext) => Promise<TDeploy>;
  protected statsFn?: (ctx: TContext) => Promise<TStats>;

  constructor(protected readonly lookup: string) {}

  public DeployType<D extends TDeploy>(
    schema: ZodType<D>,
  ): RemoveUsed<
    FluentModuleBuilder<
      TAsCode,
      TContext,
      FluentRuntime<TAsCode, TOutput, D, TStats, TServices, TSteps, TContext>,
      TModule,
      TOutput,
      D,
      TStats,
      TServices,
      TSteps,
      TUsed & { DeployType: true }
    >,
    TUsed & { DeployType: true }
  > {
    this.deploySchema = schema as any;
    return this as any;
  }

  public OutputType<O extends TOutput>(
    schema: ZodType<O>,
  ): RemoveUsed<
    FluentModuleBuilder<
      TAsCode,
      TContext,
      FluentRuntime<TAsCode, O, TDeploy, TStats, TServices, TSteps, TContext>,
      TModule,
      O,
      TDeploy,
      TStats,
      TServices,
      TSteps,
      TUsed & { OutputType: true }
    >,
    TUsed & { OutputType: true }
  > {
    this.outputSchema = schema as any;
    return this as any;
  }

  public StatsType<S extends TStats>(
    schema: ZodType<S>,
  ): RemoveUsed<
    FluentModuleBuilder<
      TAsCode,
      TContext,
      FluentRuntime<TAsCode, TOutput, TDeploy, S, TServices, TSteps, TContext>,
      TModule,
      TOutput,
      TDeploy,
      S,
      TServices,
      TSteps,
      TUsed & { StatsType: true }
    >,
    TUsed & { StatsType: true }
  > {
    this.statsSchema = schema as any;
    return this as any;
  }

  public Services<NextServices extends Record<string, unknown>>(
    factory: (
      ctx: FluentContext<TAsCode, TServices, TSteps>,
      ioc: any,
    ) => MaybeAsync<NextServices>,
  ): RemoveUsed<
    FluentModuleBuilder<
      TAsCode,
      FluentContext<TAsCode, NextServices, TSteps>,
      FluentRuntime<
        TAsCode,
        TOutput,
        TDeploy,
        TStats,
        NextServices,
        TSteps,
        FluentContext<TAsCode, NextServices, TSteps>
      >,
      TModule,
      TOutput,
      TDeploy,
      TStats,
      NextServices,
      TSteps,
      TUsed & { Services: true }
    >,
    TUsed & { Services: true }
  > {
    if (!this.stepsInjectedFirst)
      this.serviceInjectedFirst = true;
    this.servicesFactory = factory as any;
    return this as any;
  }

  public Steps<
    TStepsRecord extends Record<string, StepModule<any, any, any, any, any>>,
  >(
    factory: (
      ctx: FluentContext<TAsCode, TServices, TSteps>,
    ) => MaybeAsync<TStepsRecord>,
  ): RemoveUsed<
    FluentModuleBuilder<
      TAsCode,
      FluentContext<
        TAsCode,
        TServices,
        {
          [K in keyof TStepsRecord]: TStepsRecord[K] extends StepModule<
            infer I,
            infer O,
            any,
            any,
            any
          > ? (input: I) => Promise<O>
            : never;
        }
      >,
      FluentRuntime<
        TAsCode,
        TOutput,
        TDeploy,
        TStats,
        TServices,
        {
          [K in keyof TStepsRecord]: TStepsRecord[K] extends StepModule<
            infer I,
            infer O,
            any,
            any,
            any
          > ? (input: I) => Promise<O>
            : never;
        },
        FluentContext<
          TAsCode,
          TServices,
          {
            [K in keyof TStepsRecord]: TStepsRecord[K] extends StepModule<
              infer I,
              infer O,
              any,
              any,
              any
            > ? (input: I) => Promise<O>
              : never;
          }
        >
      >,
      TModule,
      TOutput,
      TDeploy,
      TStats,
      TServices,
      {
        [K in keyof TStepsRecord]: TStepsRecord[K] extends StepModule<
          infer I,
          infer O,
          any,
          any,
          any
        > ? (input: I) => Promise<O>
          : never;
      },
      TUsed & { SubSteps: true }
    >,
    TUsed & { SubSteps: true }
  > {
    if (!this.serviceInjectedFirst)
      this.stepsInjectedFirst = true;
    this.stepFactory = factory;
    return this as any;
  }

  public Verifications(
    factory: (ctx: TContext) => MaybeAsync<VerificationInvokerMap<TContext>>,
  ): RemoveUsed<this, TUsed & { Verifications: true }> {
    this.verificationFactory = factory;
    return this as any;
  }

  public Run(
    fn: (ctx: TContext) => Promise<TOutput>,
  ): RemoveUsed<this, TUsed & { Run: true }> {
    this.runFn = fn;
    return this as any;
  }

  public Deploy(
    fn: (ctx: TContext) => Promise<TDeploy>,
  ): RemoveUsed<this, TUsed & { Deploy: true }> {
    this.deployFn = fn;
    return this as any;
  }

  public Stats(
    fn: (ctx: TContext) => Promise<TStats>,
  ): RemoveUsed<this, TUsed & { Stats: true }> {
    this.statsFn = fn;
    return this as any;
  }

  public abstract Build(): TModule;

  protected customRuntimeClass?(): new () => TRuntime;

  protected buildRuntime(): new () => TRuntime {
    const {
      runFn,
      deployFn,
      statsFn,
      servicesFactory,
      stepFactory,
      verificationFactory,
      customRuntimeClass,
      serviceInjectedFirst,
    } = this;

    const RuntimeBase = (customRuntimeClass?.() as new () => FluentRuntime<
      TAsCode,
      TOutput,
      TDeploy,
      TStats,
      TServices,
      TSteps,
      TContext
    >) ??
      FluentRuntime<
        TAsCode,
        TOutput,
        TDeploy,
        TStats,
        TServices,
        TSteps,
        TContext
      >;

    const RuntimeImpl = class extends RuntimeBase {
      protected override didInjectServicesFirst(): boolean {
        return serviceInjectedFirst; 
      }

      override async run(ctx: TContext): Promise<TOutput> {
        return await runFn!(ctx);
      }

      override deploy?(ctx: TContext): Promise<TDeploy> {
        return deployFn!(ctx);
      }

      override stats?(ctx: TContext): Promise<TStats> {
        return statsFn!(ctx);
      }

      override async injectServices(
        ctx: TContext,
        ioc: any,
      ): Promise<Partial<TServices>> {
        const result = servicesFactory?.(ctx, ioc);
        return result instanceof Promise ? await result : result ?? {};
      }

      override async injectSteps(ctx: TContext): Promise<TSteps> {
        if (!stepFactory) return {} as TSteps;

        const modules = stepFactory(ctx);
        const resolved = modules instanceof Promise ? await modules : modules;

        const invokers: StepInvokerMap = {};
        for (const [key, mod] of Object.entries(resolved)) {
          const runtime = new mod.Step({});
          invokers[key] = async (input: unknown) => {
            const enriched = await runtime.ConfigureContext(input, {
              Key: key,
              ...ctx,
            });
            return await runtime.Execute(input, enriched);
          };
        }

        return invokers as TSteps;
      }

      override async injectVerifications(
        ctx: TContext,
      ): Promise<VerificationInvokerMap<TContext>> {
        const result = verificationFactory?.(ctx);
        return result instanceof Promise ? await result : result ?? {};
      }
    };

    return RuntimeImpl as unknown as new () => TRuntime;
  }
}

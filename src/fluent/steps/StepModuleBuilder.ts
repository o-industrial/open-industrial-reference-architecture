// deno-lint-ignore-file no-explicit-any ban-types
import { IoCContainer, ZodType } from './.deps.ts';
import { StepContext } from '../types/StepContext.ts';
import { StepInvokerMap } from './StepInvokerMap.ts';
import { defineStepModule, StepModule } from './StepModule.ts';
import { StepModuleMetadata } from './StepModuleMetadata.ts';
import { StepRuntime } from './StepRuntime.ts';
import { MaybeAsync } from '../types/MaybeAsync.ts';

type UsedKeys = Record<string, true>;
type RemoveUsed<T, Used extends UsedKeys> = Omit<T, keyof Used>;

export class StepModuleBuilder<
  TInput = unknown,
  TOutput = unknown,
  TOptions extends Record<string, unknown> = Record<string, unknown>,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSubSteps extends StepInvokerMap = StepInvokerMap,
  TUsed extends UsedKeys = {},
> {
  protected inputSchema?: ZodType<TInput>;
  protected outputSchema?: ZodType<TOutput>;
  protected optionsSchema?: ZodType<TOptions>;

  protected runFn?: (
    input: TInput,
    ctx: StepContext<TOptions, TServices, TSubSteps>,
  ) => Promise<TOutput>;

  protected initFn?: (
    input: TInput,
    ctx: StepContext<TOptions, TServices, TSubSteps>,
  ) => void | Promise<void>;

  protected cleanupFn?: (
    input: TInput,
    ctx: StepContext<TOptions, TServices, TSubSteps>,
  ) => void | Promise<void>;

  protected servicesFactory?: (
    input: TInput,
    ctx: StepContext<TOptions, TServices, TSubSteps>,
  ) => Promise<TServices>;

  protected substepFactory?: (
    input: TInput,
    ctx: StepContext<TOptions, TServices, StepInvokerMap>,
  ) =>
    | Promise<Record<string, StepModule<any, any, any, any, any>>>
    | Record<string, StepModule<any, any, any, any, any>>;

  constructor(
    protected readonly name: string,
    protected readonly description: string,
  ) {}

  public Input<I extends TInput>(
    schema: ZodType<I>,
  ): RemoveUsed<
    StepModuleBuilder<
      I,
      TOutput,
      TOptions,
      TServices,
      TSubSteps,
      TUsed & { Input: true }
    >,
    TUsed & { Input: true }
  > {
    this.inputSchema = schema as any;
    return this as any;
  }

  public Output<O extends TOutput>(
    schema: ZodType<O>,
  ): RemoveUsed<
    StepModuleBuilder<
      TInput,
      O,
      TOptions,
      TServices,
      TSubSteps,
      TUsed & { Output: true }
    >,
    TUsed & { Output: true }
  > {
    this.outputSchema = schema as any;
    return this as any;
  }

  public Options<O extends TOptions>(
    schema: ZodType<O>,
  ): RemoveUsed<
    StepModuleBuilder<
      TInput,
      TOutput,
      O,
      TServices,
      TSubSteps,
      TUsed & { Options: true }
    >,
    TUsed & { Options: true }
  > {
    this.optionsSchema = schema as any;
    return this as any;
  }

  public Services<NextServices extends Record<string, unknown>>(
    factory: (
      input: TInput,
      ctx: StepContext<TOptions, TServices, TSubSteps>,
      ioc: IoCContainer,
    ) => MaybeAsync<NextServices>,
  ): RemoveUsed<
    StepModuleBuilder<
      TInput,
      TOutput,
      TOptions,
      NextServices,
      TSubSteps,
      TUsed & { Services: true }
    >,
    TUsed & { Services: true }
  > {
    this.servicesFactory = factory as any;
    return this as any;
  }

  public Init(
    fn: (
      input: TInput,
      ctx: StepContext<TOptions, TServices, TSubSteps>,
    ) => void | Promise<void>,
  ): RemoveUsed<
    StepModuleBuilder<
      TInput,
      TOutput,
      TOptions,
      TServices,
      TSubSteps,
      TUsed & { Init: true }
    >,
    TUsed & { Init: true }
  > {
    this.initFn = fn;
    return this as any;
  }

  public Cleanup(
    fn: (
      input: TInput,
      ctx: StepContext<TOptions, TServices, TSubSteps>,
    ) => void | Promise<void>,
  ): RemoveUsed<
    StepModuleBuilder<
      TInput,
      TOutput,
      TOptions,
      TServices,
      TSubSteps,
      TUsed & { Cleanup: true }
    >,
    TUsed & { Cleanup: true }
  > {
    this.cleanupFn = fn;
    return this as any;
  }

  public Steps<
    TSteps extends Record<string, StepModule<any, any, any, any, any>>,
  >(
    factory: (
      input: TInput,
      ctx: StepContext<TOptions, TServices, StepInvokerMap>,
    ) => TSteps | Promise<TSteps>,
  ): RemoveUsed<
    StepModuleBuilder<
      TInput,
      TOutput,
      TOptions,
      TServices,
      {
        [K in keyof TSteps]: TSteps[K] extends StepModule<
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
    this.substepFactory = factory;
    return this as any;
  }

  public Resolve(): StepModuleBuilder<
    TInput,
    TOutput,
    TOptions,
    TServices,
    TSubSteps,
    TUsed & { Run: true }
  > {
    return this as unknown as StepModuleBuilder<
      TInput,
      TOutput,
      TOptions,
      TServices,
      TSubSteps,
      TUsed & { Run: true }
    >;
  }

  public Run(
    fn: (
      input: TInput,
      ctx: StepContext<TOptions, TServices, TSubSteps>,
    ) => Promise<TOutput>,
  ): RemoveUsed<
    StepModuleBuilder<
      TInput,
      TOutput,
      TOptions,
      TServices,
      TSubSteps,
      TUsed & { Run: true }
    >,
    TUsed & { Run: true }
  > {
    this.runFn = fn;
    return this as any;
  }

  public Build(
    options?: TOptions,
  ): StepModule<
    TInput,
    TOutput,
    TOptions,
    TServices,
    TSubSteps,
    StepRuntime<TInput, TOutput, TOptions, TServices, TSubSteps>
  > {
    const {
      name,
      description,
      inputSchema,
      outputSchema,
      optionsSchema,
      runFn,
      initFn,
      cleanupFn,
      servicesFactory,
      substepFactory,
    } = this;

    class BuiltStep extends StepRuntime<
      TInput,
      TOutput,
      TOptions,
      TServices,
      TSubSteps
    > {
      /** */
      constructor(opts: TOptions) {
        super({
          ...(opts ?? {}),
          ...(options ?? {}),
        });
      }
      override async Init(
        input: TInput,
        ctx: StepContext<TOptions, TServices, TSubSteps>,
      ): Promise<void> {
        if (initFn) await initFn(input, ctx);
      }

      override async Execute(
        input: TInput,
        ctx: StepContext<TOptions, TServices, TSubSteps>,
      ): Promise<TOutput> {
        return await runFn!(input, ctx);
      }

      override async Cleanup(
        input: TInput,
        ctx: StepContext<TOptions, TServices, TSubSteps>,
      ): Promise<void> {
        if (cleanupFn) await cleanupFn(input, ctx);
      }

      protected override async injectServices(
        input: TInput,
        ctx: StepContext<TOptions, TServices, TSubSteps>,
      ): Promise<Partial<TServices>> {
        return servicesFactory ? await servicesFactory(input, ctx) : {};
      }

      protected override async injectSubSteps(
        input: TInput,
        ctx: StepContext<TOptions, TServices, TSubSteps>,
      ): Promise<TSubSteps> {
        if (!substepFactory) return {} as TSubSteps;

        const stepMap = await substepFactory(input, ctx);
        const invokers: StepInvokerMap = {};

        for (const [key, mod] of Object.entries(stepMap)) {
          const runtime = new mod.Step(ctx.Options || {});
          invokers[key] = async (input: unknown): Promise<unknown> => {
            const enrichedCtx = await runtime.ConfigureContext(input, {
              Key: key,
              Metadata: runtime.BuildMetadata(),
            });
            return await runtime.Execute(input, enrichedCtx);
          };
        }

        return invokers as TSubSteps;
      }

      override BuildMetadata(): StepModuleMetadata {
        return {
          Name: name,
          Description: description,
          InputSchema: inputSchema,
          OutputSchema: outputSchema,
          OptionsSchema: optionsSchema,
        };
      }
    }

    return defineStepModule<
      TInput,
      TOutput,
      TOptions,
      TServices,
      TSubSteps,
      StepRuntime<TInput, TOutput, TOptions, TServices, TSubSteps>
    >({
      InputSchema: inputSchema!,
      OutputSchema: outputSchema!,
      OptionsSchema: optionsSchema,
      Step: BuiltStep,
    });
  }
}

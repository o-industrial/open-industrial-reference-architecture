import type { ZodType, ZodTypeDef } from './.deps.ts';
import type { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import type { FluentRuntime } from './FluentRuntime.ts';
import type { EaCDetails, EaCVertexDetails } from '../types/.deps.ts';
import { FluentContext } from '../types/FluentContext.ts';

/**
 * Generic module output from a FluentModuleBuilder.
 *
 * @template TAsCode    The full EaC details object (must extend EaCDetails<EaCVertexDetails>)
 * @template TOutput    Output result from `.Run()`
 * @template TDeploy    Output result from `.Deploy()`
 * @template TStats     Output result from `.Stats()`
 * @template TServices  Services injected into runtime
 * @template TSteps     Runtime-executable step map
 * @template TRuntime   Bound runtime instance class
 */
export type FluentModule<
  TAsCode extends EaCDetails<EaCVertexDetails>,
  TOutput = unknown,
  TDeploy = unknown,
  TStats = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
  TRuntime extends FluentRuntime<
    TAsCode,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps,
    FluentContext<TAsCode, TServices, TSteps>
  > = FluentRuntime<
    TAsCode,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps,
    FluentContext<TAsCode, TServices, TSteps>
  >,
> = {
  /**
   * Optional Zod schema describing the runtime’s output payload.
   */
  OutputSchema?: ZodType<TOutput, ZodTypeDef, TOutput>;

  /**
   * Executable runtime class that performs the configured behavior.
   */
  Runtime: new () => TRuntime;
};

/**
 * Strongly typed fluent module definition utility.
 *
 * @returns a `FluentModule<T>` object with type-safe output and runtime
 */
export function defineFluentModule<
  TAsCode extends EaCDetails<EaCVertexDetails>,
  TOutput,
  TDeploy,
  TStats,
  TServices extends Record<string, unknown>,
  TSteps extends StepInvokerMap,
  TRuntime extends FluentRuntime<
    TAsCode,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps,
    FluentContext<TAsCode, TServices, TSteps>
  >,
>(def: {
  OutputSchema?: ZodType<TOutput, ZodTypeDef, TOutput>;
  Runtime: new () => TRuntime;
}): FluentModule<
  TAsCode,
  TOutput,
  TDeploy,
  TStats,
  TServices,
  TSteps,
  TRuntime
> {
  return {
    OutputSchema: def.OutputSchema,
    Runtime: def.Runtime,
  };
}

import type { ZodType, ZodTypeDef } from './.deps.ts';
import type { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import type { FluentRuntime } from './FluentRuntime.ts';
import type { EaCDetails, EaCVertexDetails } from '../types/.deps.ts';

/**
 * Generic module output from a FluentModuleBuilder.
 *
 * @template TAsCode    The full EaC details object (must extend EaCDetails<EaCVertexDetails>)
 * @template TOutput    Output result from `.Run()`
 * @template TServices  Services injected into runtime
 * @template TSteps     Runtime-executable step map
 * @template TRuntime   Bound runtime instance class
 */
export type FluentModule<
  TAsCode extends EaCDetails<EaCVertexDetails>,
  TOutput = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
  TRuntime extends FluentRuntime<
    TAsCode,
    TOutput,
    TServices,
    TSteps
  > = FluentRuntime<TAsCode, TOutput, TServices, TSteps>,
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
  TServices extends Record<string, unknown>,
  TSteps extends StepInvokerMap,
  TRuntime extends FluentRuntime<TAsCode, TOutput, TServices, TSteps>,
>(def: {
  OutputSchema?: ZodType<TOutput, ZodTypeDef, TOutput>;
  Runtime: new () => TRuntime;
}): FluentModule<TAsCode, TOutput, TServices, TSteps, TRuntime> {
  return {
    OutputSchema: def.OutputSchema,
    Runtime: def.Runtime,
  };
}

import type { ZodType, ZodTypeDef } from './.deps.ts';
import type { StepRuntime } from './StepRuntime.ts';
import type { StepInvokerMap } from './StepInvokerMap.ts';

/**
 * Represents a fully typed, executable step module within the system.
 * Carries input/output schemas, optional options schema, and the runtime class itself.
 *
 * @template TInput      Type of the expected input payload
 * @template TOutput     Type of the output result
 * @template TOptions    Optional execution options object
 * @template TServices   Services injected during execution (e.g. SDK clients)
 * @template TSubSteps   Callable substeps mapped into the context
 * @template R           Concrete StepRuntime implementation class
 */
export type StepModule<
  TInput = unknown,
  TOutput = unknown,
  TOptions extends Record<string, unknown> = Record<string, unknown>,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSubSteps extends StepInvokerMap = StepInvokerMap,
  R extends StepRuntime<
    TInput,
    TOutput,
    TOptions,
    TServices,
    TSubSteps
  > = StepRuntime<TInput, TOutput, TOptions, TServices, TSubSteps>,
> = {
  /**
   * Zod schema describing the expected input structure.
   */
  InputSchema: ZodType<TInput, ZodTypeDef, TInput>;

  /**
   * Zod schema describing the returned output after execution.
   */
  OutputSchema: ZodType<TOutput, ZodTypeDef, TOutput>;

  /**
   * Optional Zod schema for runtime execution options (e.g. dry-run, trace).
   */
  OptionsSchema?: ZodType<TOptions, ZodTypeDef, TOptions>;

  /**
   * Executable runtime class implementing the step logic.
   * The constructor accepts optional execution options.
   */
  Step: new (options: TOptions) => R;
};

/**
 * Helper to define a StepModule with full schema typing and runtime binding.
 *
 * @template TInput      Input schema type
 * @template TOutput     Output schema type
 * @template TOptions    Execution options type
 * @template TServices   Injected services type
 * @template TSubSteps   Callable substeps map
 * @template R           Runtime class implementing StepRuntime
 */
export function defineStepModule<
  TInput,
  TOutput,
  TOptions extends Record<string, unknown>,
  TServices extends Record<string, unknown>,
  TSubSteps extends StepInvokerMap,
  R extends StepRuntime<TInput, TOutput, TOptions, TServices, TSubSteps>,
>(def: {
  InputSchema: ZodType<TInput, ZodTypeDef, TInput>;
  OutputSchema: ZodType<TOutput, ZodTypeDef, TOutput>;
  OptionsSchema?: ZodType<TOptions, ZodTypeDef, TOptions>;
  Step: new (options: TOptions) => R;
}): StepModule<TInput, TOutput, TOptions, TServices, TSubSteps, R> {
  return {
    InputSchema: def.InputSchema,
    OutputSchema: def.OutputSchema,
    OptionsSchema: def.OptionsSchema,
    Step: def.Step,
  };
}

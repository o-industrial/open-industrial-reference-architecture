import type { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import type { EaCDetails, EaCVertexDetails } from '../types/.deps.ts';
import type { FluentRuntime } from './FluentRuntime.ts';
import type { FluentContext } from '../types/FluentContext.ts';
import { FluentModuleBuilder } from './FluentModuleBuilder.ts';

/**
 * Generic entry point for creating a typed fluent module builder.
 *
 * @template TAsCode     The typed EaCDetails representing runtime config
 * @template TContext    Full runtime context (extends FluentContext)
 * @template TRuntime    Concrete runtime class (usually extends FluentRuntime)
 * @template TModule     Module shape returned from `.Build()`
 * @template TOutput     Result of `.Run()` execution
 * @template TServices   Optional service bindings (e.g., SDKs, clients)
 * @template TSteps      Optional substep callables
 * @template TBuilder    Builder type returned by the factory
 *
 * @param key            Canonical key (e.g., simulator ID or sensor name)
 * @param builderFactory A constructor function that returns a custom FluentModuleBuilder
 * @returns              A typed FluentModuleBuilder instance
 */
export function Fluent<
  TAsCode extends EaCDetails<EaCVertexDetails>,
  TOutput = unknown,
  TDeploy = unknown,
  TStats = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
  TContext extends FluentContext<TAsCode, TServices, TSteps> = FluentContext<
    TAsCode,
    TServices,
    TSteps
  >,
  TRuntime extends FluentRuntime<
    TAsCode,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps,
    TContext
  > = FluentRuntime<
    TAsCode,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps,
    TContext
  >,
  TModule = unknown,
  TBuilder extends FluentModuleBuilder<
    TAsCode,
    TContext,
    TRuntime,
    TModule,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps
  > = FluentModuleBuilder<
    TAsCode,
    TContext,
    TRuntime,
    TModule,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps
  >,
>(key: string, builderFactory: new (key: string) => TBuilder): TBuilder {
  return new builderFactory(key);
}

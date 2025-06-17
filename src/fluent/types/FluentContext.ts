import { z } from '../steps/.deps.ts';

import type { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import type { EaCDetails, EaCVertexDetails } from './.deps.ts';
import { WorkspaceContext, WorkspaceContextSchema } from './WorkspaceContext.ts';

/**
 * FluentContext is the standard runtime context for any fluent module.
 *
 * It extends the generic WorkspaceContext and adds an `AsCode` definition
 * plus optional substep invokers and a canonical `Lookup` key.
 *
 * @template TAsCode   The typed `EaCDetails` representing this runtime
 * @template TServices Optional service bindings (e.g., clients, SDKs)
 * @template TSteps    Optional substep invokers (StepInvokerMap)
 */
export type FluentContext<
  TAsCode extends EaCDetails<EaCVertexDetails> = EaCDetails<EaCVertexDetails>,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
> = WorkspaceContext<TServices> & {
  /**
   * The Everything-as-Code descriptor powering this module.
   */
  AsCode: TAsCode;

  /**
   * The key or alias used to look up this module.
   */
  Lookup: string;

  /**
   * Callable substeps available to the module at runtime.
   */
  Steps: TSteps;
};

/**
 * Minimal introspectable subset of FluentContext for logging, UI preview,
 * or detached lifecycle events. Omits secrets, injected services, and DFSs.
 */
export type FluentContextSubset = Omit<
  FluentContext,
  'AsCode' | 'Steps' | 'IoC' | 'DFSs' | 'Secrets' | 'Services'
>;

/**
 * Zod schema for validating and serializing a safe slice of FluentContext.
 */
export const FluentContextSchema: z.ZodType<FluentContextSubset> = z
  .object({
    Config: WorkspaceContextSchema.shape.Config,
    EaC: WorkspaceContextSchema.shape.EaC,
    Lookup: z.string(),
  })
  .describe('Serializable subset of FluentContext for logging or previews');

/**
 * Type helper for the output shape of FluentContextSchema.
 */
export type FluentContextSchemaType = z.infer<typeof FluentContextSchema>;

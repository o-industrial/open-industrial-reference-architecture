import { z } from '../steps/.deps.ts';

import { WorkspaceContext, WorkspaceContextSchema } from './WorkspaceContext.ts';

import type { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import type { StepModuleMetadata } from '../steps/StepModuleMetadata.ts';
import { StepModuleMetadataSchema } from '../steps/StepModuleMetadata.ts';

/**
 * StepContext defines the full runtime context for a Step module.
 * Extends the WorkspaceContext with step-specific metadata and flow params.
 *
 * @template TOptions    Runtime options type passed to the step
 * @template TServices   Typed service object injected via .Services()
 * @template TSubSteps   Optional callable substep map
 */
export type StepContext<
  TOptions = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSubSteps extends StepInvokerMap = StepInvokerMap,
> = WorkspaceContext<TServices> & {
  Key: string;

  Metadata?: StepModuleMetadata;

  Options?: TOptions;

  Steps?: TSubSteps;
};

/**
 * Minimal introspectable slice of StepContext (no secrets, ioc, dfs).
 */
export type StepContextSubset = Omit<
  StepContext,
  'Options' | 'Steps' | 'DFSs' | 'IoC' | 'Secrets' | 'Services'
>;

/**
 * Zod schema for safe serialization of step execution metadata.
 */
export const StepContextSchema: z.ZodType<StepContextSubset> = z
  .object({
    Key: z.string().describe('Canonical key identifying the step module'),
    Metadata: StepModuleMetadataSchema.optional().describe(
      'Optional developer metadata',
    ),
    Config: WorkspaceContextSchema.shape.Config,
    EaC: WorkspaceContextSchema.shape.EaC,
  })
  .describe(
    'Serializable subset of StepContext for logs, preview, or debugging',
  );

export type StepContextSchemaType = z.infer<typeof StepContextSchema>;

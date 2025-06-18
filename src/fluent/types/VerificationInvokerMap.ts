import { MaybeAsync } from './MaybeAsync.ts';

/**
 * A map of verification functions keyed by name.
 * Each function takes the full module context and returns an error string or undefined.
 */
export type VerificationInvokerMap<
  TContext,
> = Record<string, (ctx: TContext) => MaybeAsync<string | undefined>>;

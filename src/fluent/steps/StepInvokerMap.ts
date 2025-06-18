/**
 * A map of substep invoker functions, similar to CommandInvokerMap.
 * Each function receives a typed input and returns a typed result.
 */

export type StepInvokerMap = Record<
  string,
  (input?: unknown) => Promise<unknown>
>;

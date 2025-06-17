import { EaCDataConnectionAsCode, EaCDataConnectionDetails } from './.deps.ts';
import { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import { DataConnectionModuleBuilder } from './DataConnectionModuleBuilder.ts';

/**
 * Entry point for building a typed DataConnection fluent module.
 */
export function DataConnection<
  TDetails extends EaCDataConnectionDetails,
  TAsCode extends EaCDataConnectionAsCode<TDetails> = EaCDataConnectionAsCode<TDetails>,
  TOutput = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
>(key: string): DataConnectionModuleBuilder<TAsCode, TOutput, TServices, TSteps> {
  return new DataConnectionModuleBuilder<TAsCode, TOutput, TServices, TSteps>(key);
}

import { EaCDataConnectionAsCode } from '../../eac/EaCDataConnectionAsCode.ts';
import { EaCDataConnectionDetails } from '../../eac/EaCDataConnectionDetails.ts';
import { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import { DataConnectionModuleBuilder } from './DataConnectionModuleBuilder.ts';

/**
 * Entry point for building a typed DataConnection fluent module.
 */
export function DataConnection<
  TDetails extends EaCDataConnectionDetails,
  TAsCode extends EaCDataConnectionAsCode<TDetails> = EaCDataConnectionAsCode<TDetails>,
  TOutput = unknown,
  TDeploy = unknown,
  TStats = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
>(
  lookup: string,
): DataConnectionModuleBuilder<
  TAsCode,
  TOutput,
  TDeploy,
  TStats,
  TServices,
  TSteps
> {
  return new DataConnectionModuleBuilder<
    TAsCode,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps
  >(lookup);
}

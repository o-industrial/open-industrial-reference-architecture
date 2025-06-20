import { EaCDataConnectionAsCode, EaCDataConnectionDetails } from './.deps.ts';
import { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import { DataConnectionModuleBuilder } from './DataConnectionModuleBuilder.ts';
import type { Status } from 'jsr:@fathym/common@0.2.264';

/**
 * Entry point for building a typed DataConnection fluent module.
 */
export function DataConnection<
  TDetails extends EaCDataConnectionDetails,
  TAsCode extends EaCDataConnectionAsCode<TDetails> = EaCDataConnectionAsCode<TDetails>,
  TOutput = unknown,
  TDeploy = Status,
  TStats = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
>(lookup: string): DataConnectionModuleBuilder<
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

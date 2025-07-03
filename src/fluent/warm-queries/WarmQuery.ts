import { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import { EaCWarmQueryAsCode } from './.deps.ts';
import { WarmQueryModuleBuilder } from './WarmQueryModuleBuilder.ts';

/**
 * Entry point for building a typed WarmQuery fluent module.
 */
export function WarmQuery<
  TAsCode extends EaCWarmQueryAsCode = EaCWarmQueryAsCode,
  TOutput = unknown,
  TDeploy = unknown,
  TStats = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap
>(
  lookup: string
): WarmQueryModuleBuilder<
  TAsCode,
  TOutput,
  TDeploy,
  TStats,
  TServices,
  TSteps
> {
  return new WarmQueryModuleBuilder<
    TAsCode,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps
  >(lookup);
}

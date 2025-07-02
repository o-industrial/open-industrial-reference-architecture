import { EaCSimulatorAsCode } from '../../eac/EaCSimulatorAsCode.ts';
import { EaCSimulatorDetails } from '../../eac/EaCSimulatorDetails.ts';
import { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import { SimulatorModuleBuilder } from './SimulatorModuleBuilder.ts';

/**
 * Entry point for building a typed Simulator fluent module.
 */
export function Simulator<
  TDetails extends EaCSimulatorDetails,
  TAsCode extends EaCSimulatorAsCode<TDetails> = EaCSimulatorAsCode<TDetails>,
  TOutput = unknown,
  TDeploy = unknown,
  TStats = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
>(
  key: string,
): SimulatorModuleBuilder<TAsCode, TOutput, TDeploy, TStats, TServices, TSteps> {
  return new SimulatorModuleBuilder<
    TAsCode,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps
  >(key);
}

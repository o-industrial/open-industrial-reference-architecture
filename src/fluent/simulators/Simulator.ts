import { EaCSimulatorAsCode, EaCSimulatorDetails } from './.deps.ts';
import { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import { SimulatorBuilder } from './SimulatorBuilder.ts';

/**
 * Entry point for building a typed Simulator fluent module.
 */
export function Simulator<
  TDetails extends EaCSimulatorDetails,
  TAsCode extends EaCSimulatorAsCode<TDetails> = EaCSimulatorAsCode<TDetails>,
  TOutput = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
>(key: string): SimulatorBuilder<TAsCode, TOutput, TServices, TSteps> {
  return new SimulatorBuilder<TAsCode, TOutput, TServices, TSteps>(key);
}

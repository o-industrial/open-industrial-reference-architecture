import { EaCSimulatorAsCode } from '../../eac/EaCSimulatorAsCode.ts';
import { EaCSimulatorDetails } from '../../eac/EaCSimulatorDetails.ts';
import { defineFluentModule, FluentModule } from '../_/FluentModule.ts';
import { FluentModuleBuilder } from '../_/FluentModuleBuilder.ts';
import { FluentRuntime } from '../_/FluentRuntime.ts';
import type { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import type { FluentContext } from '../types/FluentContext.ts';

/**
 * Concrete builder for Simulator modules.
 */
export class SimulatorBuilder<
  TAsCode extends EaCSimulatorAsCode<EaCSimulatorDetails> = EaCSimulatorAsCode<EaCSimulatorDetails>,
  TOutput = unknown,
  TDeploy = unknown,
  TStats = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
> extends FluentModuleBuilder<
  TAsCode,
  FluentContext<TAsCode, TServices, TSteps>,
  FluentRuntime<
    TAsCode,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps,
    FluentContext<TAsCode, TServices, TSteps>
  >,
  FluentModule<TAsCode, TOutput, TDeploy, TStats, TServices, TSteps>,
  TOutput,
  TDeploy,
  TStats,
  TServices,
  TSteps
> {
  public Build(): FluentModule<
    TAsCode,
    TOutput,
    TDeploy,
    TStats,
    TServices,
    TSteps
  > {
    const Runtime = this.buildRuntime();

    return defineFluentModule({
      OutputSchema: this.outputSchema,
      Runtime,
    });
  }
}

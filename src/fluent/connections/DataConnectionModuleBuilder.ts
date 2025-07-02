import { Status } from './.deps.ts';

import type { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import type { FluentContext } from '../types/FluentContext.ts';
import { EaCDataConnectionAsCode } from '../../eac/EaCDataConnectionAsCode.ts';
import { EaCDataConnectionDetails } from '../../eac/EaCDataConnectionDetails.ts';
import { defineFluentModule, FluentModule } from '../_/FluentModule.ts';
import { FluentModuleBuilder } from '../_/FluentModuleBuilder.ts';
import { FluentRuntime } from '../_/FluentRuntime.ts';

/**
 * Concrete builder for DataConnection modules.
 */
export class DataConnectionModuleBuilder<
  TAsCode extends EaCDataConnectionAsCode<EaCDataConnectionDetails> = EaCDataConnectionAsCode<
    EaCDataConnectionDetails
  >,
  TOutput = unknown,
  TDeploy = Status,
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
      DeploySchema: this.deploySchema,
      OutputSchema: this.outputSchema,
      StatsSchema: this.statsSchema,
      Runtime,
    });
  }
}

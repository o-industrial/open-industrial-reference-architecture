import {
  defineFluentModule,
  EaCDataConnectionAsCode,
  EaCDataConnectionDetails,
  FluentModule,
  FluentModuleBuilder,
  FluentRuntime,
} from './.deps.ts';
import type { StepInvokerMap } from '../steps/StepInvokerMap.ts';
import type { FluentContext } from '../types/FluentContext.ts';

/**
 * Concrete builder for DataConnection modules.
 */
export class DataConnectionModuleBuilder<
  TAsCode extends EaCDataConnectionAsCode<EaCDataConnectionDetails> = EaCDataConnectionAsCode<
    EaCDataConnectionDetails
  >,
  TOutput = unknown,
  TServices extends Record<string, unknown> = Record<string, unknown>,
  TSteps extends StepInvokerMap = StepInvokerMap,
> extends FluentModuleBuilder<
  TAsCode,
  FluentContext<TAsCode, TServices, TSteps>,
  FluentRuntime<
    TAsCode,
    TOutput,
    TServices,
    TSteps,
    FluentContext<TAsCode, TServices, TSteps>
  >,
  FluentModule<TAsCode, TOutput, TServices, TSteps>,
  TOutput,
  TServices,
  TSteps
> {
  public Build(): FluentModule<TAsCode, TOutput, TServices, TSteps> {
    const Runtime = this.buildRuntime();

    return defineFluentModule({
      OutputSchema: this.outputSchema,
      Runtime,
    });
  }
}

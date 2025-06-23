import {
  EaCApplicationProcessorConfig,
  EaCRuntimeHandler,
  EverythingAsCode,
  IoCContainer,
  ProcessorHandlerResolver,
} from '../.deps.ts';
import { isEaCGlobalDataIngestProcessor } from './EaCGlobalDataIngestProcessor.ts';
import { isEaCOIDataConnectionProcessor } from './EaCOIDataConnectionProcessor.ts';

export class DefaultOpenIndustrialProcessorHandlerResolver implements ProcessorHandlerResolver {
  public async Resolve(
    ioc: IoCContainer,
    appProcCfg: EaCApplicationProcessorConfig,
    eac: EverythingAsCode,
  ): Promise<EaCRuntimeHandler | undefined> {
    let toResolveName: string = '';

    if (isEaCGlobalDataIngestProcessor(appProcCfg.Application.Processor)) {
      toResolveName = 'EaCGlobalDataIngestProcessor';
    } else if (
      isEaCOIDataConnectionProcessor(appProcCfg.Application.Processor)
    ) {
      toResolveName = 'EaCOIDataConnectionProcessor';
    }

    if (toResolveName) {
      const resolver = await ioc.Resolve<ProcessorHandlerResolver>(
        ioc.Symbol('ProcessorHandlerResolver'),
        toResolveName,
      );

      return await resolver.Resolve(ioc, appProcCfg, eac);
    } else {
      return undefined;
    }
  }
}

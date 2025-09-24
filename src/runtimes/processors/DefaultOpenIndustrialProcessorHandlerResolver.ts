import {
  EaCApplicationProcessorConfig,
  EaCRuntimeHandler,
  EverythingAsCode,
  IoCContainer,
  ProcessorHandlerResolver,
} from '../.deps.ts';
import { isEaCGlobalDataIngestProcessor } from './EaCGlobalDataIngestProcessor.ts';
import { isEaCInterfaceAppProcessor } from './EaCInterfaceAppProcessor.ts';
import { isEaCOIDataConnectionProcessor } from './EaCOIDataConnectionProcessor.ts';
import { isEaCOIImpulseStreamProcessor } from './EaCOIImpulseStreamProcessor.ts';

export class DefaultOpenIndustrialProcessorHandlerResolver implements ProcessorHandlerResolver {
  public async Resolve(
    ioc: IoCContainer,
    appProcCfg: EaCApplicationProcessorConfig,
    eac: EverythingAsCode,
  ): Promise<EaCRuntimeHandler | undefined> {
    let toResolveName = '';

    if (isEaCGlobalDataIngestProcessor(appProcCfg.Application.Processor)) {
      toResolveName = 'EaCGlobalDataIngestProcessor';
    } else if (
      isEaCOIDataConnectionProcessor(appProcCfg.Application.Processor)
    ) {
      toResolveName = 'EaCOIDataConnectionProcessor';
    } else if (
      isEaCOIImpulseStreamProcessor(appProcCfg.Application.Processor)
    ) {
      toResolveName = 'EaCOIImpulseStreamProcessor';
    } else if (
      isEaCInterfaceAppProcessor(appProcCfg.Application.Processor)
    ) {
      toResolveName = 'EaCInterfaceAppProcessor';
    }

    if (!toResolveName) {
      return undefined;
    }

    const resolver = await ioc.Resolve<ProcessorHandlerResolver>(
      ioc.Symbol('ProcessorHandlerResolver'),
      toResolveName,
    );

    return await resolver.Resolve(ioc, appProcCfg, eac);
  }
}

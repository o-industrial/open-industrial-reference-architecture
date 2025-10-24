import {
  EaCApplicationProcessorConfig,
  type EaCPreactAppProcessor,
  EaCRuntimeHandler,
  getPackageLogger,
  IoCContainer,
  ProcessorHandlerResolver,
} from '../.deps.ts';
import { EaCInterfaceAppHandler } from '../interface/EaCInterfaceAppHandler.ts';
import { isEaCInterfaceAppProcessor } from './EaCInterfaceAppProcessor.ts';

export const EaCInterfaceAppProcessorHandlerResolver: ProcessorHandlerResolver = {
  async Resolve(
    ioc: IoCContainer,
    appProcCfg: EaCApplicationProcessorConfig,
    eac,
): Promise<EaCRuntimeHandler> {
    const processor = appProcCfg.Application.Processor;
    if (!isEaCInterfaceAppProcessor(processor)) {
      throw new Deno.errors.NotSupported(
        'The provided processor is not supported by the EaCInterfaceAppProcessorHandlerResolver.',
      );
    }

    const logger = await getPackageLogger(import.meta);
    const handler = new EaCInterfaceAppHandler(ioc, logger);

    await handler.Configure(
      appProcCfg,
      eac.DFSs ?? {},
      eac.$GlobalOptions?.DFSs ?? {},
      Date.now().toString(),
    );

    const preactProcessor = processor as unknown as EaCPreactAppProcessor;
    await handler.Build(preactProcessor, {}, {});

    return (req, ctx) => handler.Execute(preactProcessor, req, ctx);
  },
};

import { EaCApplicationsLoggingProvider } from '../.deps.ts';

export class OIRuntimeLoggingProvider extends EaCApplicationsLoggingProvider {
  constructor() {
    const loggingPackages = ['@o-industrial/common', '@o-industrial/o-industrial', '@o-industrial'];

    super(loggingPackages);
  }
}

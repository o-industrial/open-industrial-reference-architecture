import { EaCApplicationsLoggingProvider } from '../.deps.ts';

export class RuntimeLoggingProvider extends EaCApplicationsLoggingProvider {
  constructor() {
    const loggingPackages = ['@o-industrial/common', '@o-industrial/o-industrial'];

    super(loggingPackages);
  }
}

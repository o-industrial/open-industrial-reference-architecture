import { EaCProcessor, isEaCProcessor } from '../.deps.ts';

/**
 * Processor configuration for delivering Interface HMIs via the runtime.
 */
export type EaCInterfaceAppProcessor = {
  /** DFS lookup that stores generated interface bundles and assets. */
  AppDFSLookup: string;

  /** Optional base segment used when composing interface routes. */
  RoutesBase?: string;

  /** Optional component DFS lookups to hydrate shared islands and registries. */
  ComponentDFSLookups?: [string, string[]][];

  /** Additional DFS lookups to merge into the virtual interface DFS. */
  RegistryDFSLookups?: string[];
} & EaCProcessor<'InterfaceApp'>;

/**
 * Type guard to validate an `EaCInterfaceAppProcessor` definition.
 */
export function isEaCInterfaceAppProcessor(
  proc: unknown,
): proc is EaCInterfaceAppProcessor {
  const processor = proc as EaCInterfaceAppProcessor;

  return (
    isEaCProcessor('InterfaceApp', processor) &&
    typeof processor?.AppDFSLookup === 'string' &&
    processor.AppDFSLookup.length > 0
  );
}

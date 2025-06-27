import { EaCProcessor, isEaCProcessor } from '../.deps.ts';

export type EaCOIImpulseStreamProcessor = {
  NATSServer: string;

  NATSToken?: string;
} & EaCProcessor<'OIImpulseStream'>;

export function isEaCOIImpulseStreamProcessor(
  proc: unknown
): proc is EaCOIImpulseStreamProcessor {
  const x = proc as EaCOIImpulseStreamProcessor;

  return (
    isEaCProcessor('OIImpulseStream', x) &&
    typeof x.NATSServer === 'string'
  );
}

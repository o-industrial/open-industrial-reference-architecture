import { JetStreamManager, StreamConfig } from './.deps.ts';
import { ensureJetStreamStream } from './ensureJetStreamStream.ts';

export function ensureWorkspaceSurfaceJetStream(
  jsm: JetStreamManager,
  workspaceLookup: string,
  surfaceLookup: string,
  jetStreamDefaults?: Partial<StreamConfig>,
  withUpdate?: boolean,
) {
  const stream = `workspace.${workspaceLookup}.surface.${surfaceLookup}`;
  const subject = `${stream}.*.*.impulse`;

  return ensureJetStreamStream(
    jsm,
    stream,
    [subject],
    jetStreamDefaults,
    withUpdate,
  );
}

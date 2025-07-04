import { JetStreamManager, StreamConfig } from './.deps.ts';
import { ensureJetStreamStream } from './ensureJetStreamStream.ts';

export function ensureWorkspaceJetStreamBuilder(
  jsm: JetStreamManager,
  workspaceLookup: string,
  jetStreamDefaults?: Partial<StreamConfig>,
  withUpdate?: boolean,
) {
  const stream = `workspace.${workspaceLookup}`;
  const subject = `${stream}.*.*.impulse`;

  return ensureJetStreamStream(
    jsm,
    stream,
    [subject],
    jetStreamDefaults,
    withUpdate,
  );
}

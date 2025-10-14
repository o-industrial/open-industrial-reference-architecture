import { JetStreamManager, StreamConfig } from 'npm:nats@2.29.2';
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

export { merge } from 'jsr:@fathym/common@0.2.264/merge';

export type { EaCRuntimeHandler } from 'jsr:@fathym/eac@0.2.112/runtime/pipelines';
export type { EaCCommitResponse } from 'jsr:@fathym/eac@0.2.112/steward';
export { EaCBaseClient } from 'jsr:@fathym/eac@0.2.112/steward/clients';
export type { EaCStatus } from 'jsr:@fathym/eac@0.2.112/steward/status';

export {
  type Codec,
  connect,
  type JetStreamClient,
  type JetStreamManager,
  type NatsConnection,
  StringCodec,
} from 'npm:nats@2.29.2';

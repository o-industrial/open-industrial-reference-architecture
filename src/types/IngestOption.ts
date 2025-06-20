import { MultiProtocolIngestOption } from '../eac/EaCDataConnectionDetails.ts';

export type IngestOption = {
  label: string;
  value: MultiProtocolIngestOption;
  enabled: boolean;
};

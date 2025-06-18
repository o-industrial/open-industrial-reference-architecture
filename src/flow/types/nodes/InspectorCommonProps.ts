import { EaCVertexDetails } from '../../.deps.ts';

export type InspectorCommonProps<
  TDetails extends EaCVertexDetails = EaCVertexDetails,
  TStats extends Record<string, unknown> = Record<string, unknown>,
  TConfig extends Record<string, unknown> = Record<string, unknown>,
> = {
  config?: TConfig;
  details: Partial<TDetails>;
  enabled: boolean;

  useStats: () => TStats | undefined;

  onDelete: () => void;
  onDetailsChanged: (next: Partial<TDetails>) => void;
  onToggleEnabled: (enabled: boolean) => void;
};

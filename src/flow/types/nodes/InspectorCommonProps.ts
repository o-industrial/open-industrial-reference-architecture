import { WorkspaceManager } from '../../../../atomic/.deps.ts';
import { OpenIndustrialAPIClient } from '../../../api/clients/OpenIndustrialAPIClient.ts';
import { EaCVertexDetails } from '../../.deps.ts';

export type InspectorCommonProps<
  TDetails extends EaCVertexDetails = EaCVertexDetails,
  TStats extends Record<string, unknown> = Record<string, unknown>,
  TConfig extends Record<string, unknown> = Record<string, unknown>,
> = {
  config?: TConfig;
  details: Partial<TDetails>;
  enabled: boolean;
  oiSvc: OpenIndustrialAPIClient;
  workspaceMgr: WorkspaceManager;

  useStats: () => TStats | undefined;

  onDelete: () => void;
  onDetailsChanged: (next: Partial<TDetails>) => void;
  onToggleEnabled: (enabled: boolean) => void;
};

import { EaCVertexDetails } from '../../.deps.ts';
import { OpenIndustrialAPIClient } from '../../../api/clients/OpenIndustrialAPIClient.ts';
import { BaseNodeEvent } from '../react/BaseNodeEvent.ts';
import { WorkspaceManager } from '../../managers/WorkspaceManager.tsx';

export type InspectorCommonProps<
  TDetails extends EaCVertexDetails = EaCVertexDetails,
  TStats extends Record<string, unknown> = Record<string, unknown>,
  TConfig extends Record<string, unknown> = Record<string, unknown>,
  TEvent extends BaseNodeEvent = BaseNodeEvent,
> = {
  config?: TConfig;
  details: Partial<TDetails>;
  enabled: boolean;
  lookup: string;
  oiSvc: OpenIndustrialAPIClient;
  surfaceLookup?: string;
  workspaceMgr: WorkspaceManager;

  useStats: () => TStats | undefined;

  onDelete: () => void;
  onDetailsChanged: (next: Partial<TDetails>) => void;

  onNodeEvent?: (event: TEvent) => void;

  onToggleEnabled: (enabled: boolean) => void;
};

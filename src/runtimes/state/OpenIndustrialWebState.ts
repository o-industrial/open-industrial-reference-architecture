import type { EaCRefreshController, EaCUserLicense, EaCUserRecord } from '../.deps.ts';
import type { OpenIndustrialAPIClient } from '../../api/clients/OpenIndustrialAPIClient.ts';
import type { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import type { OpenIndustrialJWTPayload } from '../../types/OpenIndustrialJWTPayload.ts';
import type { CurrentUserManager } from '../managers/CurrentUserManager.ts';

export type OpenIndustrialWebState = {
  AzureAccessToken?: () => Promise<string | undefined>;

  CurrentUser: CurrentUserManager;

  OIClient: OpenIndustrialAPIClient;

  OIKV: Deno.Kv;

  OIJWT: string;

  Refresher: EaCRefreshController;

  UserLicenses?: Record<string, EaCUserLicense>;

  UserWorkspaces: EaCUserRecord[];

  Workspace: EverythingAsCodeOIWorkspace;
} & OpenIndustrialJWTPayload;

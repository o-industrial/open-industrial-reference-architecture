import { EaCRefreshController, type EaCUserLicense, type EaCUserRecord } from '../.deps.ts';
import { OpenIndustrialAPIClient } from '../../api/clients/OpenIndustrialAPIClient.ts';
import { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import { OpenIndustrialJWTPayload } from '../../types/OpenIndustrialJWTPayload.ts';
import { CurrentUserManager } from '../managers/CurrentUserManager.ts';

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

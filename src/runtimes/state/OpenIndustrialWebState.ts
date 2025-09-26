import { OpenIndustrialAPIClient } from '@o-industrial/common/api';
import { EverythingAsCodeOIWorkspace } from '@o-industrial/common/eac';
import { OpenIndustrialJWTPayload } from '@o-industrial/common/types';
import { EaCUserRecord } from '@fathym/eac';
import { EaCUserLicense } from '@fathym/eac-licensing';
import { EaCRefreshController } from '@fathym/eac-applications/runtime/refresh';
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


// deno-lint-ignore-file no-explicit-any
import { EaCApplicationsRuntimeContext } from '@fathym/eac-applications/runtime';
import type { EverythingAsCodeIdentity } from '@fathym/eac-identity';
import type { EaCLicensePlanAsCode, EverythingAsCodeLicensing } from '@fathym/eac-licensing';
import type { EverythingAsCodeOIWorkspace } from '@o-industrial/common/eac';
import type { OpenIndustrialWebState } from '../state/OpenIndustrialWebState.ts';
import { loadJwtConfig } from '@fathym/common';
import { OpenIndustrialJWTPayload } from '@o-industrial/common/types';
import { OpenIndustrialAPIClient } from '@o-industrial/common/api';

/**
 * Resolve effective access rights for the current user by:
 * - Expanding active license plans to AccessConfiguration lookups
 * - Including any direct user access cards (ad hoc assignments)
 * - Expanding AccessConfiguration lookups to AccessRight lookups
 */
export async function resolveAccessRights(
  ctx: EaCApplicationsRuntimeContext<
    OpenIndustrialWebState,
    Record<string, unknown>,
    EverythingAsCodeOIWorkspace
  >,
): Promise<{
  rights: string[];
  sources?: { cards?: string[]; licenses?: string[] };
}> {
  const username = ctx.State.Username;
  if (!username) return { rights: [] };

  const eac = ctx.Runtime.EaC as EverythingAsCodeOIWorkspace;
  const idEac = (eac || {}) as EverythingAsCodeIdentity;
  const licEac = (eac || {}) as EverythingAsCodeLicensing;

  const acFromLicenses = new Set<string>();
  const acFromCards = new Set<string>();

  const oiApiRoot = Deno.env.get('OPEN_INDUSTRIAL_API_ROOT')!;

  const apiBaseUrl = new URL(oiApiRoot);

  const workspaceLookup = ctx.Runtime.EaC?.EnterpriseLookup || '';

  const token = await loadJwtConfig().Create({
    Username: username,
    WorkspaceLookup: workspaceLookup as string,
  } as OpenIndustrialJWTPayload);

  const oiClient = new OpenIndustrialAPIClient(apiBaseUrl, token);

  // 1) Licenses → AccessConfigurationLookups
  let userLicenses = ctx.State.UserLicenses;
  try {
    if (!userLicenses || Object.keys(userLicenses).length === 0) {
      // Opportunistic fetch via admin API; swallow errors (e.g., if not permitted)
      userLicenses = await oiClient.Admin.ListUserLicenses(username);
    }
  } catch (_err) {
    // ignore; licenses remain undefined
  }

  if (userLicenses) {
    for (const [licLookup, lic] of Object.entries(userLicenses)) {
      const planLookup = (lic as any).PlanLookup || 'default';
      const plan = licEac?.Licenses?.[licLookup]?.Plans?.[planLookup] as
        | EaCLicensePlanAsCode
        | undefined;
      const acLookups = plan?.AccessConfigurationLookups || [];
      for (const ac of acLookups) acFromLicenses.add(ac);
    }
  }

  // 2) Direct access cards
  try {
    const cards = await oiClient.Admin.ListUserAccessCards(username);
    for (const card of cards || []) {
      if (card?.AccessConfigurationLookup) {
        acFromCards.add(card.AccessConfigurationLookup);
      }
    }
  } catch (err) {
    // ignore; user may not have direct assignments or endpoint may be restricted
    console.log(err);
  }

  // 3) Expand AccessConfigurations → rights
  const rights = new Set<string>();
  const acDefs = idEac?.AccessConfigurations || {};
  for (const ac of [...acFromLicenses, ...acFromCards]) {
    const cfg = acDefs?.[ac];
    const rls = cfg?.AccessRightLookups || [];
    for (const r of rls) rights.add(r);
  }

  return {
    rights: Array.from(rights),
    sources: {
      licenses: Array.from(acFromLicenses),
      cards: Array.from(acFromCards),
    },
  };
}


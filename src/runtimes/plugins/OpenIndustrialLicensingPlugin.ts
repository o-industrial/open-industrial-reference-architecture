import { EaCRuntimeConfig, EaCRuntimePluginConfig } from '@fathym/eac/runtime/config';
import { EaCRuntimePlugin } from '@fathym/eac/runtime/plugins';

import { EaCStripeProcessor } from '@fathym/eac-applications/processors';
import { loadEaCLicensingSvc } from '@fathym/eac-licensing/clients';
import { loadJwtConfig } from '@fathym/common';

export default class OpenIndustrialLicensingPlugin implements EaCRuntimePlugin {
  constructor() {}

  public Setup(config: EaCRuntimeConfig): Promise<EaCRuntimePluginConfig> {
    const pluginConfig: EaCRuntimePluginConfig = {
      Name: OpenIndustrialLicensingPlugin.name,
      EaC: {
        Applications: {
          licensingApi: {
            Details: {
              Name: 'Open Industrial Licensing API',
              Description: 'The licensing API for Open Industrial.',
            },
            ModifierResolvers: {},
            Processor: {
              Type: 'Stripe',
              DatabaseLookup: 'oi',
              LicenseLookup: 'o-industrial',
              HandleSubscription: async (
                entLookup,
                username,
                licLookup,
                planLookup,
                priceLookup,
              ) => {
                const log = config.LoggingProvider.Package;

                // small helpers (inline to keep the snippet self-contained)
                const traceId = crypto?.randomUUID?.() ??
                  Math.random().toString(36).slice(2, 10);
                const t0 = Date.now();
                const done = () => Date.now() - t0;
                const safeError = (e: unknown) =>
                  e instanceof Error ? { name: e.name, message: e.message, stack: e.stack } : {
                    message: (() => {
                      try {
                        return JSON.stringify(e);
                      } catch {
                        return String(e);
                      }
                    })(),
                  };

                log.info(
                  () =>
                    `[lic-sub][${traceId}] start ent=${entLookup} user=${username} lic=${licLookup} plan=${planLookup} price=${priceLookup}`,
                );

                try {
                  log.debug(
                    () =>
                      `[lic-sub][${traceId}] creating JWT for ent=${entLookup} user=${username}`,
                  );
                  const jwt = await loadJwtConfig().Create({
                    EnterpriseLookup: entLookup,
                    WorkspaceLookup: entLookup,
                    Username: username,
                    // AccessRights: TODO: pass through context in this helper
                  });
                  log.debug(
                    () => `[lic-sub][${traceId}] JWT created (token not logged)`,
                  );

                  log.debug(
                    () => `[lic-sub][${traceId}] loading licensing service`,
                  );
                  const licSvc = await loadEaCLicensingSvc(jwt);

                  log.debug(
                    () =>
                      `[lic-sub][${traceId}] calling licSvc.License.Subscription lic=${licLookup} plan=${planLookup} price=${priceLookup}`,
                  );
                  const licSubRes = await licSvc.License.Subscription(
                    entLookup,
                    username,
                    licLookup,
                    planLookup,
                    priceLookup,
                  );

                  log.info(
                    () => `[lic-sub][${traceId}] subscription handled ok in ${done()}ms`,
                  );
                  log.debug(
                    () =>
                      `[lic-sub][${traceId}] response keys=${
                        Object.keys(
                          licSubRes ?? {},
                        ).join(',')
                      }`,
                  );

                  return licSubRes;
                } catch (err) {
                  log.error(
                    `[lic-sub][${traceId}] error during subscription`,
                    safeError(err),
                  );
                  throw err; // preserve existing error behavior
                } finally {
                  log.debug(
                    () => `[lic-sub][${traceId}] end durationMs=${done()}`,
                  );
                }
              },
            } as EaCStripeProcessor,
          },
        },
        Licenses: {
          'o-industrial': {
            DatabaseLookup: 'oi',
            Details: {
              Name: 'OpenIndustrial',
              Description: 'The main access license for OpenIndustrial',
              Enabled: true,
              PublishableKey: Deno.env.get('STRIPE_PUBLISHABLE_KEY')!,
              SecretKey: Deno.env.get('STRIPE_SECRET_KEY')!,
              WebhookSecret: Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
            },
            Plans: {
              standard: {
                Details: {
                  Name: 'Standard',
                  Description: 'Get started in our shared cloud',
                  Featured: 'Popular',
                  Features: [
                    'Shared Azure Cloud Hosting',
                    '1 Enterprise Workspace',
                    'Unlimited Schemas & Agents',
                  ],
                  Priority: 300,
                },
                Prices: {
                  monthly: {
                    Details: {
                      Name: 'Monthly',
                      Currency: 'USD',
                      Discount: 0,
                      Interval: 'month',
                      Value: 99.99,
                    },
                  },
                  yearly: {
                    Details: {
                      Name: 'Yearly',
                      Currency: 'USD',
                      Discount: 15,
                      Interval: 'year',
                      Value: 999.99,
                    },
                  },
                },
              },

              pro: {
                Details: {
                  Name: 'Pro',
                  Description: 'Scale with a managed private runtime',
                  Featured: '',
                  Features: [
                    'Managed Azure Cloud Runtime',
                    'Unlimited Workspaces',
                    'Dedicated Surface Isolation',
                    'Priority Support',
                  ],
                  Priority: 200,
                },
                Prices: {
                  monthly: {
                    Details: {
                      Name: 'Monthly',
                      Currency: 'USD',
                      Discount: 0,
                      Interval: 'month',
                      Value: 249.99,
                    },
                  },
                  yearly: {
                    Details: {
                      Name: 'Yearly',
                      Currency: 'USD',
                      Discount: 20,
                      Interval: 'year',
                      Value: 2499.99,
                    },
                  },
                },
              },

              sovereign: {
                Details: {
                  Name: 'Sovereign',
                  Description: 'Bring your own cloud and retain full control',
                  Featured: 'Enterprise',
                  Features: [
                    'Self-Hosted Azure Deployment',
                    'Unlimited Workspaces',
                    'Runtime Access & System CLI',
                    'Federated Memory & Governance Support',
                    'Priority Engineering Access',
                    '* + Annual Enterprise License',
                  ],
                  Priority: 100,
                },
                Prices: {
                  monthly: {
                    Details: {
                      Name: 'Monthly',
                      Currency: 'USD',
                      Discount: 0,
                      Interval: 'month',
                      Value: 499.99,
                    },
                  },
                  yearly: {
                    Details: {
                      Name: 'Annual License',
                      Currency: 'USD',
                      Discount: 0,
                      Interval: 'year',
                      Value: 4999.99,
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    return Promise.resolve(pluginConfig);
  }

  // public async Build(
  //   _eac: EverythingAsCode,
  //   _ioc: IoCContainer,
  //   pluginCfg?: EaCRuntimePluginConfig,
  // ): Promise<void> {
  //   const label = crypto?.randomUUID?.() ?? `eac-build-${Date.now().toString(36)}`;
  //   const mask = (s?: string | null) => !s ? '' : `${s.slice(0, 6)}…${s.slice(-4)}`;

  //   console.time(label);
  //   console.info(`[eac-build][${label}] start`);

  //   const eacApiKey = Deno.env.get('EAC_API_KEY');

  //   if (!eacApiKey) {
  //     console.info(`[eac-build][${label}] skip: EAC_API_KEY not set`);
  //     console.timeEnd(label);
  //     return;
  //   }
  //   if (!pluginCfg) {
  //     console.info(`[eac-build][${label}] skip: pluginCfg not provided`);
  //     console.timeEnd(label);
  //     return;
  //   }

  //   try {
  //     console.debug(`[eac-build][${label}] apiKey=${mask(eacApiKey)}`);

  //     const [_header, payload] = await djwt.decode(eacApiKey);
  //     const { EnterpriseLookup } = payload as Record<string, string>;

  //     if (!EnterpriseLookup) {
  //       console.warn(
  //         `[eac-build][${label}] JWT payload missing EnterpriseLookup; aborting remote commit`,
  //       );
  //       console.timeEnd(label);
  //       return;
  //     }

  //     console.debug(
  //       `[eac-build][${label}] EnterpriseLookup=${EnterpriseLookup}`,
  //     );

  //     const eacSvc = await loadEaCStewardSvc(eacApiKey);

  //     const body = {
  //       EnterpriseLookup,
  //       ...(pluginCfg.EaC ?? {}),
  //     };

  //     console.info(
  //       `[eac-build][${label}] committing EaC keys=${
  //         Object.keys(pluginCfg.EaC ?? {}).join(',') || '∅'
  //       }`,
  //     );

  //     const commitResp = await eacSvc.EaC.Commit(body, 600);

  //     const status = await waitForStatus(
  //       eacSvc,
  //       EnterpriseLookup,
  //       commitResp.CommitID,
  //     );

  //     const durationMs = status?.EndTime && status?.StartTime
  //       ? new Date(status.EndTime).getTime() -
  //         new Date(status.StartTime).getTime()
  //       : undefined;

  //     console.info(
  //       `[eac-build][${label}] commit ${commitResp.CommitID} → ${status?.Processing} ` +
  //         `(user=${status?.Username}, durationMs=${durationMs ?? 'n/a'})`,
  //     );

  //     // Optional: tiny messages peek (first 3 keys)
  //     const msgKeys = Object.keys(status?.Messages ?? {});
  //     if (msgKeys.length) {
  //       console.info(
  //         `[eac-build][${label}] messages: ${msgKeys.slice(0, 3).join(', ')}${
  //           msgKeys.length > 3 ? ', …' : ''
  //         }`,
  //       );
  //     }

  //     console.info(status?.Messages);
  //   } catch (err) {
  //     const safe = err instanceof Error
  //       ? { name: err.name, message: err.message, stack: err.stack }
  //       : {
  //         message: (() => {
  //           try {
  //             return JSON.stringify(err);
  //           } catch {
  //             return String(err);
  //           }
  //         })(),
  //       };

  //     console.error(
  //       `[eac-build][${label}] Unable to update EaC Licensing, falling back to local config.`,
  //       safe,
  //     );
  //   } finally {
  //     console.debug(`[eac-build][${label}] end`);
  //     console.timeEnd(label);
  //   }
  // }
}


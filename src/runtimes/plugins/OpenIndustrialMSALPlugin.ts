import {
  createOAuthHelpers,
  EaCMSALProcessor,
  type EaCRuntimeConfig,
  type EaCRuntimePlugin,
  type EaCRuntimePluginConfig,
  type EverythingAsCode,
  type EverythingAsCodeApplications,
  type EverythingAsCodeDenoKV,
  type EverythingAsCodeIdentity,
  type IoCContainer,
  loadOAuth2ClientConfig,
  MSALPlugin,
} from '../.deps.ts';

export default class OpenIndustrialMSALPlugin implements EaCRuntimePlugin {
  constructor() {}

  public Setup(_config: EaCRuntimeConfig): Promise<EaCRuntimePluginConfig> {
    const pluginConfig: EaCRuntimePluginConfig<
      & EverythingAsCode
      & EverythingAsCodeApplications
      & EverythingAsCodeDenoKV
      & EverythingAsCodeIdentity
    > = {
      Name: 'OpenBiotechMSALPlugin',
      Plugins: [
        new MSALPlugin({
          async Resolve(
            ioc: IoCContainer,
            _processor: unknown,
            eac: EverythingAsCode & EverythingAsCodeIdentity,
          ) {
            const primaryProviderLookup = Object.keys(eac.Providers || {}).find(
              (pl) => eac.Providers![pl].Details!.IsPrimary,
            );

            const provider = eac.Providers![primaryProviderLookup!]!;

            const oAuthConfig = loadOAuth2ClientConfig(provider)!;

            const helpers = createOAuthHelpers(oAuthConfig);

            const kv = await ioc.Resolve<Deno.Kv>(
              Deno.Kv,
              provider.DatabaseLookup,
            );

            const keyRoot = ['MSAL', 'Session'];

            return {
              async Clear(req: Request) {
                const sessionId = await helpers.getSessionId(req);

                const kvKey = [...keyRoot, sessionId!];

                const results = await kv.list({ prefix: kvKey });

                for await (const result of results) {
                  await kv.delete(result.key);
                }
              },
              async Load(req: Request, key: string) {
                const sessionId = await helpers.getSessionId(req);

                const kvKey = [...keyRoot, sessionId!, key];

                const res = await kv.get(kvKey);

                return res.value;
              },
              async Set(req: Request, key: string, value: unknown) {
                const sessionId = await helpers.getSessionId(req);

                const kvKey = [...keyRoot, sessionId!, key];

                await kv.set(kvKey, value, {
                  expireIn: 1000 * 60 * 30,
                });
              },
            };
          },
        }),
      ],
    };

    return Promise.resolve(pluginConfig);
  }
}

import { Step } from '../../../../fluent/steps/Step.ts';
import { StepModuleBuilder } from '../../../../fluent/steps/StepModuleBuilder.ts';
import { ClientSecretCredential, ConfidentialClientApplication } from '../../.deps.ts';
import {
  AzureResolveCredentialInput,
  AzureResolveCredentialInputSchema,
} from './AzureResolveCredentialInput.ts';
import {
  AzureResolveCredentialOutput,
  AzureResolveCredentialOutputSchema,
} from './AzureResolveCredentialOutput.ts';

type TStepBuilder = StepModuleBuilder<
  AzureResolveCredentialInput,
  AzureResolveCredentialOutput
>;

export const AzureResolveCredentialStep: TStepBuilder = Step(
  'Resolve Azure Credential',
  'Resolves an Azure access token using various auth strategies',
)
  .Input(AzureResolveCredentialInputSchema)
  .Output(AzureResolveCredentialOutputSchema)
  .Services((input) => {
    const { Method, TenantId, ClientId, ClientSecret, Token, Scopes } = input;

    switch (Method) {
      case 'token': {
        if (!Token) throw new Error('Missing Token for `token` Method.');

        return Promise.resolve({
          resolveToken: () => Promise.resolve(Token),
        });
      }

      case 'clientSecret': {
        if (!TenantId || !ClientId || !ClientSecret) {
          throw new Error('Missing required fields for ClientSecret.');
        }

        const cred = new ClientSecretCredential(
          TenantId,
          ClientId,
          ClientSecret,
        );

        return Promise.resolve({
          resolveToken: async () => {
            const raw = await cred.getToken(
              'https://management.azure.com/.default',
            );
            if (!raw?.token) {
              throw new Error('Failed to get token via ClientSecret.');
            }
            return raw.token;
          },
        });
      }

      case 'oboAssertion': {
        if (!Token || !ClientId || !ClientSecret || !Scopes) {
          throw new Error('Missing required fields for OBO flow.');
        }

        const cca = new ConfidentialClientApplication({
          auth: {
            clientId: ClientId,
            clientSecret: ClientSecret,
            authority: `https://login.microsoftonline.com/${TenantId ?? 'common'}`,
          },
        });

        return Promise.resolve({
          resolveToken: async () => {
            const result = await cca.acquireTokenOnBehalfOf({
              oboAssertion: Token,
              scopes: Scopes,
            });

            if (!result?.accessToken) throw new Error('OBO resolution failed');
            return result.accessToken;
          },
        });
      }

      default: {
        throw new Error(`Unsupported Method: ${Method}`);
      }
    }
  })
  .Run(async (_input, ctx) => {
    const token = await ctx.Services?.resolveToken();
    return { AccessToken: token };
  }) as unknown as TStepBuilder;

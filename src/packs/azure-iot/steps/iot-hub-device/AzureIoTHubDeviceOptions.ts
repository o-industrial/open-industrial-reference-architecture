import { z } from '../../.deps.ts';
import { AzureResolveCredentialInputSchema } from '../resolve-credential/AzureResolveCredentialInput.ts';

export const AzureIoTHubDeviceOptionsSchema: z.ZodObject<{
  SubscriptionID: z.ZodString;
  ResourceGroupName: z.ZodString;
  CredentialStrategy: z.ZodObject<{
    Method: z.ZodEnum<['token', 'clientSecret', 'oboAssertion']>;
    TenantId: z.ZodOptional<z.ZodString>;
    ClientId: z.ZodOptional<z.ZodString>;
    ClientSecret: z.ZodOptional<z.ZodString>;
    Token: z.ZodOptional<z.ZodString>;
    Scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
  }>;
}> = z.object({
  SubscriptionID: z.string().describe('Azure subscription ID'),
  ResourceGroupName: z.string().describe('Azure resource group name'),
  CredentialStrategy: AzureResolveCredentialInputSchema,
});

export type AzureIoTHubDeviceOptions = z.infer<
  typeof AzureIoTHubDeviceOptionsSchema
>;

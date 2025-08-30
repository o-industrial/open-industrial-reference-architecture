// deno-lint-ignore-file no-explicit-any
import { z } from '../../.deps.ts';
import { Step } from '../../../../fluent/steps/Step.ts';
import { StepModuleBuilder } from '../../../../fluent/steps/StepModuleBuilder.ts';
import { AzureResolveCredentialStep } from '../resolve-credential/AzureResolveCredentialStep.ts';
import { AzureResolveCredentialInputSchema } from '../resolve-credential/AzureResolveCredentialInput.ts';
import { shaHash } from '../../../../utils/shaHash.ts';

import { ResourceManagementClient } from 'npm:@azure/arm-resources@6.1.0';

// ---------- Input / Output ----------

export const WorkspaceEnsureAzureResourceGroupInputSchema: z.ZodObject<{
  WorkspaceLookup: z.ZodString;
}> = z.object({
  WorkspaceLookup: z.string(),
});

export type WorkspaceEnsureAzureResourceGroupInput = z.infer<
  typeof WorkspaceEnsureAzureResourceGroupInputSchema
>;

export const WorkspaceEnsureAzureResourceGroupOutputSchema: z.ZodObject<{
  ResourceGroupName: z.ZodString;
}> = z.object({
  ResourceGroupName: z.string(),
});

export type WorkspaceEnsureAzureResourceGroupOutput = z.infer<
  typeof WorkspaceEnsureAzureResourceGroupOutputSchema
>;

// ---------- Options ----------

export const WorkspaceEnsureAzureResourceGroupOptionsSchema: z.ZodObject<{
  SubscriptionID: z.ZodString;
  CredentialStrategy: typeof AzureResolveCredentialInputSchema;
}> = z.object({
  SubscriptionID: z.string(),
  CredentialStrategy: AzureResolveCredentialInputSchema,
});

export type WorkspaceEnsureAzureResourceGroupOptions = z.infer<
  typeof WorkspaceEnsureAzureResourceGroupOptionsSchema
>;

// ---------- Step ----------

type TStepBuilder = StepModuleBuilder<
  WorkspaceEnsureAzureResourceGroupInput,
  WorkspaceEnsureAzureResourceGroupOutput,
  WorkspaceEnsureAzureResourceGroupOptions
>;

export const WorkspaceEnsureAzureResourceGroupStep: TStepBuilder = Step(
  'Azure Resource Group Ensure (SDK)',
  'Ensures the resource group for a workspace exists using Azure SDK'
)
  .Input(WorkspaceEnsureAzureResourceGroupInputSchema)
  .Output(WorkspaceEnsureAzureResourceGroupOutputSchema)
  .Options(WorkspaceEnsureAzureResourceGroupOptionsSchema)
  .Steps(() => ({
    ResolveCredential: AzureResolveCredentialStep.Build(),
  }))
  .Services((_input, ctx) => {
    const { CredentialStrategy, SubscriptionID } = ctx.Options!;

    const credential = {
      getToken: async () => {
        const { AccessToken } = await ctx.Steps!.ResolveCredential(
          CredentialStrategy
        );

        return {
          token: AccessToken,
          expiresOnTimestamp: Date.now() + 3600 * 1000,
        };
      },
    };

    const ResourceClient = new ResourceManagementClient(
      credential as any,
      SubscriptionID
    );

    return { ResourceClient };
  })
  .Run(async (input, ctx) => {
    const { WorkspaceLookup } = input;
    const { ResourceClient } = ctx.Services!;
    const location = 'westus2';

    const hash = await shaHash(WorkspaceLookup, '');
    const ResourceGroupName = `eac-ws-${hash}`;

    await ResourceClient.resourceGroups.createOrUpdate(ResourceGroupName, {
      location,
      tags: {
        WorkspaceLookup,
      },
    });

    return { ResourceGroupName };
  }) as unknown as TStepBuilder;

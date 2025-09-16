// deno-lint-ignore-file no-explicit-any
import { z } from '../../.deps.ts';
import { Step } from '../../../../fluent/steps/Step.ts';
import { StepModuleBuilder } from '../../../../fluent/steps/StepModuleBuilder.ts';
import { AzureResolveCredentialStep } from '../resolve-credential/AzureResolveCredentialStep.ts';
import { AzureResolveCredentialInputSchema } from '../resolve-credential/AzureResolveCredentialInput.ts';

import { ContainerAppsAPIClient } from 'npm:@azure/arm-appcontainers@2.2.0';

// ---------- Input / Output ----------

export const AzureContainerAppStopInputSchema: z.ZodObject<{
  ResourceGroupName: z.ZodString;
  AppName: z.ZodString;
}> = z.object({
  ResourceGroupName: z.string(),
  AppName: z.string(),
});

export type AzureContainerAppStopInput = z.infer<
  typeof AzureContainerAppStopInputSchema
>;

export const AzureContainerAppStopOutputSchema: z.ZodObject<{
  AppName: z.ZodString;
  Status: z.ZodLiteral<'Stopped'>;
}> = z.object({
  AppName: z.string(),
  Status: z.literal('Stopped'),
});

export type AzureContainerAppStopOutput = z.infer<
  typeof AzureContainerAppStopOutputSchema
>;

// ---------- Options ----------

export const AzureContainerAppStopOptionsSchema: z.ZodObject<{
  SubscriptionID: z.ZodString;
  CredentialStrategy: typeof AzureResolveCredentialInputSchema;
}> = z.object({
  SubscriptionID: z.string(),
  CredentialStrategy: AzureResolveCredentialInputSchema,
});

export type AzureContainerAppStopOptions = z.infer<
  typeof AzureContainerAppStopOptionsSchema
>;

// ---------- Step ----------

type TStepBuilder = StepModuleBuilder<
  AzureContainerAppStopInput,
  AzureContainerAppStopOutput,
  AzureContainerAppStopOptions
>;

export const AzureContainerAppStopStep: TStepBuilder = Step(
  'Azure Container App Stop (SDK)',
  'Stops a container app using Azure SDK',
)
  .Input(AzureContainerAppStopInputSchema)
  .Output(AzureContainerAppStopOutputSchema)
  .Options(AzureContainerAppStopOptionsSchema)
  .Steps(() => ({
    ResolveCredential: AzureResolveCredentialStep.Build(),
  }))
  .Services((_input, ctx) => {
    const { CredentialStrategy, SubscriptionID } = ctx.Options!;

    const credential = {
      getToken: async () => {
        const { AccessToken } = await ctx.Steps!.ResolveCredential(
          CredentialStrategy,
        );

        return {
          token: AccessToken,
          expiresOnTimestamp: Date.now() + 3600 * 1000,
        };
      },
    };

    const ContainerAppClient = new ContainerAppsAPIClient(
      credential as any,
      SubscriptionID,
    );

    return { ContainerAppClient };
  })
  .Run(async (input, ctx) => {
    const { ResourceGroupName, AppName } = input;
    const { ContainerAppClient } = ctx.Services!;

    try {
      // Preferred: call stop on the container app
      // deno-lint-ignore no-explicit-any
      const ops: any = ContainerAppClient.containerApps as any;
      if (typeof ops.beginStopAndWait === 'function') {
        await ops.beginStopAndWait(ResourceGroupName, AppName);
      } else if (typeof ops.beginStop === 'function') {
        await ops.beginStop(ResourceGroupName, AppName);
      } else {
        // Fallback: set scale maxReplicas to 0 via update
        const current = await ContainerAppClient.containerApps.get(
          ResourceGroupName,
          AppName,
        );

        current.template = current.template || {} as any;
        current.template.scale = { minReplicas: 0, maxReplicas: 0 } as any;

        await ContainerAppClient.containerApps.beginCreateOrUpdateAndWait(
          ResourceGroupName,
          AppName,
          current,
        );
      }
    } catch (err) {
      // If stopping fails (e.g., app not found), surface a clean error
      throw new Error(`Failed to stop container app '${AppName}': ${err?.message ?? err}`);
    }

    return { AppName, Status: 'Stopped' };
  }) as unknown as TStepBuilder;


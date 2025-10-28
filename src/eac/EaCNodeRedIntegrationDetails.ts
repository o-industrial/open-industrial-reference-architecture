import { z } from './.deps.ts';
import { EaCIntegrationDetails, EaCIntegrationDetailsSchema } from './EaCIntegrationDetails.ts';

export const NodeRedDeployStrategies = ['import', 'sync'] as const;
export type NodeRedDeployStrategy = (typeof NodeRedDeployStrategies)[number];

export type EaCNodeRedFlowBundle = {
  /** DFS lookup pointing to the exported Node-RED flow JSON bundle. */
  SourceDFSLookup: string;

  /** Optional human friendly description of the bundle. */
  Description?: string;

  /** Whether the SOP should automatically deploy this bundle during execution. */
  AutoDeploy?: boolean;
};

const EaCNodeRedFlowBundleSchema: z.ZodType<EaCNodeRedFlowBundle> = z.object({
  SourceDFSLookup: z
    .string()
    .min(1)
    .describe('DFS lookup pointing to the exported Node-RED flow JSON bundle.'),
  Description: z.string().optional(),
  AutoDeploy: z.boolean().optional(),
});

/**
 * Details describing a Node-RED OEM integration.
 */
export type EaCNodeRedIntegrationDetails = {
  /** Discriminator identifying the integration subtype. */
  Type: 'NodeRedIntegration';

  /** Base URL of the target Node-RED instance. */
  ServerUrl: string;

  /** Secret lookup providing credentials for the Node-RED admin API. */
  AdminApiSecretLookup: string;

  /** Optional deployment strategy when applying flow bundles. */
  DeployStrategy?: NodeRedDeployStrategy;

  /** Optional secret lookup used when wiring outbound webhooks. */
  WebhookSecretLookup?: string;

  /** Flow bundles (stored in DFS) that should be registered with the Node-RED instance. */
  FlowBundles?: Record<string, EaCNodeRedFlowBundle>;
} & EaCIntegrationDetails<'NodeRedIntegration'>;

/**
 * Zod schema for `EaCNodeRedIntegrationDetails`.
 */
export const EaCNodeRedIntegrationDetailsSchema: z.ZodType<EaCNodeRedIntegrationDetails> =
  EaCIntegrationDetailsSchema.extend({
    Type: z
      .literal('NodeRedIntegration')
      .describe('Discriminator identifying the Node-RED integration subtype.'),
    ServerUrl: z
      .string()
      .url()
      .describe('Base URL of the target Node-RED instance.'),
    AdminApiSecretLookup: z
      .string()
      .min(1)
      .describe('Secret lookup providing credentials for the Node-RED admin API.'),
    DeployStrategy: z
      .enum(NodeRedDeployStrategies)
      .optional()
      .describe('Optional deployment strategy when applying flow bundles.'),
    WebhookSecretLookup: z
      .string()
      .optional()
      .describe('Optional secret lookup used when wiring outbound webhooks.'),
    FlowBundles: z
      .record(EaCNodeRedFlowBundleSchema)
      .optional()
      .describe(
        'Flow bundles stored in DFS that should be registered with the Node-RED instance.',
      ),
  }).describe('Details describing a Node-RED OEM integration.');

/**
 * Type guard for `EaCNodeRedIntegrationDetails`.
 */
export function isEaCNodeRedIntegrationDetails(
  value: unknown,
): value is EaCNodeRedIntegrationDetails {
  return EaCNodeRedIntegrationDetailsSchema.safeParse(value).success;
}

/**
 * Validates and parses an object as `EaCNodeRedIntegrationDetails`.
 */
export function parseEaCNodeRedIntegrationDetails(
  value: unknown,
): EaCNodeRedIntegrationDetails {
  return EaCNodeRedIntegrationDetailsSchema.parse(value);
}

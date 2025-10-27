import { EaCVertexDetails, EaCVertexDetailsSchema, z } from './.deps.ts';

const ResourceGroupSchema = z.object({
  Name: z.string().optional(),
  Location: z.string(),
  Tags: z.record(z.string()).optional(),
});

const NetworkSubnetSchema = z.object({
  Name: z.string(),
  AddressPrefix: z.string(),
});

const NetworkSchema = z.object({
  Name: z.string(),
  AddressSpace: z.string(),
  Subnets: z.array(NetworkSubnetSchema),
});

const KeyVaultPermissionSchema = z.object({
  Keys: z.array(z.string()).optional(),
  Secrets: z.array(z.string()).optional(),
  Certificates: z.array(z.string()).optional(),
  Storage: z.array(z.string()).optional(),
});

const KeyVaultAccessPolicySchema = z.object({
  TenantId: z.string(),
  ObjectId: z.string(),
  Permissions: KeyVaultPermissionSchema,
});

const KeyVaultSchema = z.object({
  VaultName: z.string(),
  AccessPolicies: z.array(KeyVaultAccessPolicySchema).optional(),
  Tags: z.record(z.string()).optional(),
});

const LogAnalyticsSchema = z.object({
  WorkspaceName: z.string(),
  RetentionInDays: z.number().optional(),
  Tags: z.record(z.string()).optional(),
});

const DiagnosticsTargetSchema = z.object({
  ResourceId: z.string(),
  Logs: z.array(z.string()).optional(),
  Metrics: z.array(z.string()).optional(),
});

const DiagnosticsSchema = z.object({
  WorkspaceResourceId: z.string().optional(),
  Targets: z.array(DiagnosticsTargetSchema),
});

const GovernancePolicySchema = z.object({
  Id: z.string(),
  Parameters: z.record(z.unknown()).optional(),
});

const GovernanceRoleSchema = z.object({
  RoleDefinitionId: z.string(),
  PrincipalId: z.string(),
  Condition: z.string().optional(),
  ConditionVersion: z.string().optional(),
});

const GovernanceSchema = z.object({
  Scope: z.string(),
  PolicyDefinitions: z.array(GovernancePolicySchema).optional(),
  RoleAssignments: z.array(GovernanceRoleSchema).optional(),
});

const OutputsSchema = z
  .object({
    Providers: z.unknown().optional(),
    LandingZone: z.unknown().optional(),
    KeyVault: z.unknown().optional(),
    LogAnalytics: z.unknown().optional(),
    Diagnostics: z.unknown().optional(),
    Governance: z.unknown().optional(),
    CommitID: z.string().optional(),
  })
  .passthrough()
  .optional();

/**
 * Details describing an Azure foundation (landing zone) deployment.
 */
export type EaCFoundationDetails = EaCVertexDetails & {
  WorkspaceLookup?: string;
  ResourceGroup: z.infer<typeof ResourceGroupSchema>;
  Network?: z.infer<typeof NetworkSchema>;
  KeyVault?: z.infer<typeof KeyVaultSchema>;
  LogAnalytics?: z.infer<typeof LogAnalyticsSchema>;
  Diagnostics?: z.infer<typeof DiagnosticsSchema>;
  Governance?: z.infer<typeof GovernanceSchema>;
  Outputs?: Record<string, unknown>;
};

/**
 * Zod schema for `EaCFoundationDetails`.
 */
export const EaCFoundationDetailsSchema: z.ZodType<EaCFoundationDetails> = EaCVertexDetailsSchema
  .extend({
    WorkspaceLookup: z
      .string()
      .optional()
      .describe('Optional override for the workspace lookup the foundation belongs to.'),
    ResourceGroup: ResourceGroupSchema.describe(
      'Resource group configuration for the landing zone.',
    ),
    Network: NetworkSchema.optional().describe('Virtual network configuration for the landing zone.'),
    KeyVault: KeyVaultSchema.optional().describe('Key Vault bootstrap configuration.'),
    LogAnalytics: LogAnalyticsSchema.optional().describe('Log Analytics workspace configuration.'),
    Diagnostics: DiagnosticsSchema
      .optional()
      .describe('Diagnostics settings to apply to target resources.'),
    Governance: GovernanceSchema.optional().describe('Policy and RBAC governance configuration.'),
    Outputs: OutputsSchema.describe('Latest recorded outputs from actuator executions.').optional(),
  })
  .describe('Details describing a workspace foundation plan.');

/**
 * Type guard for `EaCFoundationDetails`.
 */
export function isEaCFoundationDetails(
  value: unknown,
): value is EaCFoundationDetails {
  return EaCFoundationDetailsSchema.safeParse(value).success;
}

/**
 * Validates and parses an object as `EaCFoundationDetails`.
 */
export function parseEaCFoundationDetails(value: unknown): EaCFoundationDetails {
  return EaCFoundationDetailsSchema.parse(value);
}
